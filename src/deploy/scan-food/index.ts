/* ═══════════════════════════════════════════════════════════════
   HITFAT+ · scan-food  (hardened)

   What the old function got wrong: it accepted the anon key as its
   caller identity. The anon key ships inside the HTML, so anyone who
   opened View Source could call this endpoint in a loop and spend
   Seth's Anthropic budget. The browser's "3 scans left" counter was
   never a limit — it was a label.

   This version answers three questions before it spends a cent:
     1. Who is calling?          → verify the user's JWT, not the anon key
     2. Are they allowed more?   → free tier, then a pass, then credits,
                                   read from plus_entitlements (client cannot write it)
     3. Record what was spent    → plus_scans, and decrement a credit if one was used

   Deploy:  supabase functions deploy scan-food
   Secrets: supabase secrets set ANTHROPIC_API_KEY=...
            (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected
             automatically — do not set them by hand)
   ═══════════════════════════════════════════════════════════════ */

import { createClient } from 'jsr:@supabase/supabase-js@2';

/* Opus is the most capable option and what Seth asked for. Identifying
   a plate of food is well within Haiku's range at a fraction of the
   cost — if the bill matters more than the last few points of accuracy,
   change this one line to 'claude-haiku-4-5-20251001' and redeploy. */
const MODEL = 'claude-opus-5';

const FREE_SCANS_PER_MONTH = 3;
const MAX_IMAGE_BYTES = 1_500_000;   // ~1.1MB of base64; the client sends ~60KB

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

const SYSTEM = `You identify food from a photograph and estimate its nutrition.
The user is Malaysian, so expect Malaysian and Southeast Asian dishes.

Reply with a single JSON object and nothing else. No markdown, no code fence,
no commentary. Use exactly these keys:

{
  "food_name": "English name of the dish",
  "food_name_bm": "Malay name, or an empty string if there is no distinct one",
  "portion_size": "what you judged the serving to be, e.g. '1 plate, about 350g'",
  "estimated_calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "confidence": "high" | "medium" | "low",
  "breakdown": [ { "ingredient": "string", "weight_g": number, "calories": number } ]
}

Rules:
- If the image contains no food, set food_name to "" and estimated_calories to 0.
- Estimate the portion actually shown, not a standard serving.
- Malaysian cooking is oilier than most databases assume. Account for that.
- Never invent a dish you cannot see. Low confidence is a valid answer.`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405);

  try {
    /* ── 1. Who is calling? ───────────────────────────────────
       The anon key is not an identity. A real user session is.     */
    const auth = req.headers.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) return json({ error: 'Sign in to use Meal Scan.' }, 401);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user) return json({ error: 'Sign in to use Meal Scan.' }, 401);

    /* The anon key IS a valid JWT, and getUser() would happily accept
       it if it ever carried a session. Reject any token that is not a
       real signed-in user. */
    if (!user.id || user.role === 'anon') {
      return json({ error: 'Sign in to use Meal Scan.' }, 401);
    }

    /* ── 2. Are they entitled? ────────────────────────────────
       Free tier, then a live pass, then credits — the same order the
       client shows, so what the button promises is what happens.      */
    const { data: ents, error: eErr } = await admin
      .from('plus_entitlements')
      .select('id, sku, kind, credits_left, expires_at')
      .eq('user_id', user.id);

    /* Fail closed. If entitlements cannot be read we do not know what this
       caller is allowed, and guessing in their favour is how a bill runs
       away. */
    if (eErr) return json({ error: 'Could not check your account. Try again shortly.' }, 503);

    const now = Date.now();
    const livePass = (ents || []).find((e) =>
      e.kind === 'pass' && e.expires_at && new Date(e.expires_at).getTime() > now);

    let creditRow: any = null;
    let mode: 'free' | 'pass' | 'credits' = 'free';

    if (livePass) {
      mode = 'pass';
    } else {
      const month = new Date().toISOString().slice(0, 7);
      const { count, error: cErr } = await admin
        .from('plus_scans')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('month', month);
      if (cErr) return json({ error: 'Could not verify your scan quota. Try again shortly.' }, 503);

      if ((count ?? 0) < FREE_SCANS_PER_MONTH) {
        mode = 'free';
      } else {
        creditRow = (ents || [])
          .filter((e) => e.kind === 'credits' && (e.credits_left ?? 0) > 0)
          .sort((a, b) => (a.credits_left ?? 0) - (b.credits_left ?? 0))[0] || null;

        if (!creditRow) {
          return json({
            error: 'You have used all 3 free scans this month.',
            code: 'quota_exceeded',
            used: count,
            limit: FREE_SCANS_PER_MONTH,
          }, 402);
        }
        mode = 'credits';
      }
    }

    /* ── 3. Validate the payload before spending anything ─────  */
    let body: any;
    try { body = await req.json(); }
    catch { return json({ error: 'Bad request body.' }, 400); }

    const b64: string = (body?.image_base64 || '').replace(/^data:image\/\w+;base64,/, '');
    if (!b64)                       return json({ error: 'No image received.' }, 400);
    if (b64.length > MAX_IMAGE_BYTES) return json({ error: 'Image too large.' }, 413);
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) return json({ error: 'Image is not valid base64.' }, 400);

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'Scan is not configured yet.' }, 500);

    /* ── 4. Ask Anthropic ─────────────────────────────────────  */
    const ai = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } },
            { type: 'text',  text: `Identify this meal and estimate its nutrition. Context: ${
              String(body?.context || 'Malaysian food').slice(0, 120)}.` },
          ],
        }],
      }),
    });

    if (!ai.ok) {
      const detail = await ai.text();
      console.error('anthropic error', ai.status, detail.slice(0, 400));
      /* Nothing is written to plus_scans here — a failed scan must not
         burn one of the user's three. */
      return json({ error: 'Scan failed. Try again, or log the meal by hand.' }, 502);
    }

    const out = await ai.json();
    const text: string = (out?.content || [])
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('')
      .trim();

    /* The model is told to return bare JSON, but a stray code fence is
       the most common way that instruction gets bent. Strip it rather
       than failing the user's scan over punctuation. */
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    let result: any;
    try { result = JSON.parse(cleaned); }
    catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (!m) {
        console.error('unparseable model reply', cleaned.slice(0, 400));
        return json({ error: 'Could not read the result. Try a clearer photo.' }, 502);
      }
      try { result = JSON.parse(m[0]); }
      catch { return json({ error: 'Could not read the result. Try a clearer photo.' }, 502); }
    }

    const kcal = Math.round(Number(result?.estimated_calories ?? result?.calories ?? 0)) || 0;
    const name = String(result?.food_name || '').trim();

    /* ── 5. Record the spend ──────────────────────────────────
       Only after a successful, parsed result. A failed scan must not cost
       the user one of their three, or one of their credits.            */
    const { error: insErr } = await admin.from('plus_scans').insert({
      user_id: user.id, kcal, food_name: name.slice(0, 120),
      /* Same UTC month string the quota count above filters on. Computed here
         rather than by a generated column, which Postgres rejects because no
         timestamptz-to-month expression is IMMUTABLE. */
      month: new Date().toISOString().slice(0, 7),
    });
    if (insErr) console.error('plus_scans insert failed', insErr.message);

    if (mode === 'credits' && creditRow) {
      /* Guarded decrement: the filter re-checks the balance we read, so two
         requests racing on the last credit cannot both spend it. */
      const { error: decErr } = await admin
        .from('plus_entitlements')
        .update({ credits_left: (creditRow.credits_left ?? 0) - 1 })
        .eq('id', creditRow.id)
        .eq('credits_left', creditRow.credits_left);
      if (decErr) console.error('credit decrement failed', decErr.message);
    }

    return json({
      ...result,
      estimated_calories: kcal,
      mode,
      model: MODEL,
    });

  } catch (e) {
    console.error('scan-food crashed', e);
    return json({ error: 'Scan failed. Try again, or log the meal by hand.' }, 500);
  }
});
