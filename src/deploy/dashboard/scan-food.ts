/* ═══════════════════════════════════════════════════════════════
   Single-file build for the Supabase dashboard editor, which takes one
   file per function. The shared catalogue and grant helper are inlined
   below instead of imported.

   Generated — do not hand-edit. The source of truth is
   deploy/<name>/index.ts plus deploy/_shared/.
   ═══════════════════════════════════════════════════════════════ */


import { createClient } from 'jsr:@supabase/supabase-js@2';

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


/* Sonnet (12 Oct 2026): close to Opus at naming a plate and splitting it
   into what is on it, at about half the cost. Opus was the first choice;
   Haiku is cheaper again but slips on mixed rice plates and look-alike
   local dishes. One line to change, then redeploy. */
const MODEL = 'claude-sonnet-5-5';

const FREE_SCANS_PER_MONTH = 3;
/* Ladies Burn 30 (25 Oct 2026, Seth): whoever owns it gets 10 free scans in
   the 30 days from when it opened on her account, instead of 3 a month, so
   she can try scanning her meals while she starts. After the 30 days, or
   the 10, it is the usual 3 a month (and Scan 6 is offered). */
const LADIES_SKU = 'prog_lad4', LADIES_FREE_SCANS = 10, LADIES_FREE_DAYS = 30;

/* Typed meals (20 Oct 2026, after Simple's "type what you ate"): the member
   writes "nasi lemak + teh tarik kurang manis" and gets the same estimate a
   photo would. Text is cheap, so it has its own daily allowance and never
   spends a photo scan: 30 a day with a live pass (HITFAT+ or a scan add-on),
   5 a day without. Each one is a row in plus_text_logs. Haiku reads text
   well enough; photos keep Sonnet. */
const TEXT_MODEL = 'claude-haiku-5-5';
const TEXT_DAY_MEMBER = 30, TEXT_DAY_FREE = 5, TEXT_MAX = 300;
const TEXT_SYSTEM = `You estimate the nutrition of a meal from what a person typed.
The person is Malaysian and may write in Malay, English or a mix, with local
dish names, quantities ("2 telur", "separuh pinggan", "1 cawan") and drink
orders ("teh tarik kurang manis", "kopi o kosong", "milo ais").

Reply with a single JSON object and nothing else. No markdown, no code fence,
no commentary. Use exactly these keys:

{
  "food_name": "a short English name for the whole meal",
  "food_name_bm": "a short Malay name for the whole meal",
  "portion_size": "what you assumed, e.g. '1 plate nasi lemak + 1 glass teh tarik'",
  "estimated_calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "confidence": "high" | "medium" | "low",
  "breakdown": [ { "ingredient": "each item as the person would name it", "weight_g": number, "calories": number } ]
}

Rules:
- One breakdown item per food or drink the person named, with the quantity they gave.
- No quantity given: assume one normal Malaysian serving and say so in portion_size.
- Malaysian cooking is oilier and drinks sweeter than most databases assume. Account for that,
  and for "kurang manis", "kosong", "separuh" when written.
- If the text is not food or drink, set food_name to "" and estimated_calories to 0.`;

/* Scans a day by what is live on the account (12 Oct 2026). A HITFAT+
   membership gives 3; the Meal Scan add-ons give 3, 6, or "unlimited",
   which is fair use at 15 so one account cannot run up the bill. The old
   scan passes count as unlimited. The highest live allowance applies. */
const MEMBER_SCANS_DAY = 3;
const SCANS_DAY: Record<string, number> = { scan_d3: 3, scan_d6: 6, scan_dx: 15, scan_m: 15, scan_y: 15 };
function dailyFor(sku: string): number {
  if (sku.startsWith('sub_')) return MEMBER_SCANS_DAY;
  return SCANS_DAY[sku] || 0;
}
/* Midnight in Malaysia (UTC+8), as an instant — "today" for the daily count. */
function dayStartMY(): string {
  const MYT = 8 * 3600e3;
  return new Date(Math.floor((Date.now() + MYT) / 864e5) * 864e5 - MYT).toISOString();
}
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
  "breakdown": [ { "ingredient": "string", "weight_g": number, "calories": number, "x": number, "y": number } ]
}

Rules:
- In breakdown, x and y are where that item sits in the photo: the centre of
  it, as a percentage of the photo's width (x) and height (y), 0 to 100.
- If the image contains no food, set food_name to "" and estimated_calories to 0.
- Estimate the portion actually shown, not a standard serving.
- Malaysian cooking is oilier than most databases assume. Account for that.
- Never invent a dish you cannot see. Low confidence is a valid answer.`;

/* A nutrition label is read, not estimated (12 Oct 2026): every number as
   printed, per serving. Malaysian labels often print per 100 g and per
   serving side by side, in English or Malay. */
const LABEL_SYSTEM = `You read a food's nutrition information panel from a photograph.
Labels may be in English or Malay ("Maklumat Pemakanan", "Tenaga", "Protein",
"Karbohidrat", "Lemak", "Gula", "Natrium", "Saiz hidangan").

Reply with a single JSON object and nothing else. No markdown, no code fence,
no commentary. Use exactly these keys:

{
  "food_name": "the product's name if it is visible, otherwise 'Packaged food'",
  "food_name_bm": "",
  "portion_size": "the serving size exactly as printed, e.g. '1 serving · 30 g'",
  "estimated_calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "sugar_g": number or null,
  "fiber_g": number or null,
  "sodium_mg": number or null,
  "confidence": "high" | "medium" | "low",
  "breakdown": []
}

Rules:
- Copy the numbers exactly as printed. Do not estimate or round differently.
- Use the PER SERVING column. If there is only a per 100 g (or 100 ml)
  column, use it and set portion_size to "100 g" (or "100 ml").
- Energy printed only in kJ: divide by 4.184 for kcal.
- Sodium printed in g: give it in mg.
- If no nutrition panel is readable, set food_name to "" and estimated_calories to 0,
  and confidence to "low".`;

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

    /* ── A typed meal: its own allowance, its own model, no photo scan spent ── */
    let body: any;
    try { body = await req.json(); }
    catch { return json({ error: 'Bad request body.' }, 400); }
    if (body?.mode === 'text') return await textMeal(admin, user.id, body);

    /* ── 2. Are they entitled? ────────────────────────────────
       Free tier, then a live pass, then credits — the same order the
       client shows, so what the button promises is what happens.      */
    const { data: ents, error: eErr } = await admin
      .from('plus_entitlements')
      .select('id, sku, kind, credits_left, expires_at, created_at')
      .eq('user_id', user.id);

    /* Fail closed. If entitlements cannot be read we do not know what this
       caller is allowed, and guessing in their favour is how a bill runs
       away. */
    if (eErr) return json({ error: 'Could not check your account. Try again shortly.' }, 503);

    const now = Date.now();
    const daily = (ents || [])
      .filter((e) => e.kind === 'pass' && e.expires_at && new Date(e.expires_at).getTime() > now)
      .reduce((m, e) => Math.max(m, dailyFor(String(e.sku))), 0);

    /* when her Ladies Burn 30 opened, if that was in the last 30 days */
    const ladiesFrom = (ents || [])
      .filter((e) => e.sku === LADIES_SKU && e.created_at && now - new Date(e.created_at).getTime() < LADIES_FREE_DAYS * 864e5)
      .map((e) => String(e.created_at)).sort().pop() || '';

    let creditRow: any = null;
    let mode: 'free' | 'pass' | 'credits' = 'free';
    let usedToday = 0;
    const pickCredit = () => (ents || [])
      .filter((e) => e.kind === 'credits' && (e.credits_left ?? 0) > 0)
      .sort((a, b) => (a.credits_left ?? 0) - (b.credits_left ?? 0))[0] || null;

    if (daily > 0) {
      const { count, error: dErr } = await admin
        .from('plus_scans')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', dayStartMY());
      if (dErr) return json({ error: 'Could not verify your scans for today. Try again shortly.' }, 503);
      usedToday = count ?? 0;
      if (usedToday < daily) {
        mode = 'pass';
      } else {
        /* a leftover credit from the old packs still buys one more */
        creditRow = pickCredit();
        if (!creditRow) {
          return json({
            error: `You have used all ${daily} scans for today. They reset at midnight.`,
            code: 'daily_limit',
            used: usedToday,
            limit: daily,
          }, 402);
        }
        mode = 'credits';
      }
    } else if (ladiesFrom) {
      /* her Ladies Burn 30 welcome: 10 in the 30 days since it opened */
      const { count, error: lErr } = await admin
        .from('plus_scans')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', ladiesFrom);
      if (lErr) return json({ error: 'Could not verify your scan quota. Try again shortly.' }, 503);
      if ((count ?? 0) < LADIES_FREE_SCANS) {
        mode = 'free';
      } else {
        creditRow = pickCredit();
        if (!creditRow) {
          return json({
            error: `You have used your ${LADIES_FREE_SCANS} Ladies Burn 30 scans.`,
            code: 'quota_exceeded',
            used: count,
            limit: LADIES_FREE_SCANS,
          }, 402);
        }
        mode = 'credits';
      }
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
        creditRow = pickCredit();

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
        system: body?.mode === 'label' ? LABEL_SYSTEM : SYSTEM,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } },
            { type: 'text',  text: body?.mode === 'label'
                ? 'Read this nutrition label.'
                : `Identify this meal and estimate its nutrition. Context: ${
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
      scans: daily > 0 ? { daily, today: usedToday + 1 } : undefined,
    });

  } catch (e) {
    console.error('scan-food crashed', e);
    return json({ error: 'Scan failed. Try again, or log the meal by hand.' }, 500);
  }
});

/* ═══ a typed meal ═══ */
function parseModelJSON(text: string): any {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(cleaned); } catch { /* fall through */ }
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}
async function textMeal(admin: any, uid: string, body: any): Promise<Response> {
  const what = String(body?.text || '').replace(/\s+/g, ' ').trim().slice(0, TEXT_MAX);
  if (what.length < 2) return json({ error: 'Type what you ate first.' }, 400);

  const { data: ents, error: eErr } = await admin.from('plus_entitlements')
    .select('kind, expires_at').eq('user_id', uid);
  if (eErr) return json({ error: 'Could not check your account. Try again shortly.' }, 503);
  const now = Date.now();
  const member = (ents || []).some((e: any) => e.kind === 'pass' && e.expires_at && new Date(e.expires_at).getTime() > now);
  const limit = member ? TEXT_DAY_MEMBER : TEXT_DAY_FREE;
  const { count, error: cErr } = await admin.from('plus_text_logs')
    .select('id', { count: 'exact', head: true }).eq('user_id', uid).gte('created_at', dayStartMY());
  if (cErr) return json({ error: 'Could not check today\'s count. Try again shortly.' }, 503);
  if ((count ?? 0) >= limit) {
    return json({ error: `That is ${limit} typed meals today. Log by hand, or try again tomorrow.`, code: 'text_limit', limit }, 402);
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return json({ error: 'Not configured yet.' }, 500);
  const ai = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: TEXT_MODEL, max_tokens: 800, system: TEXT_SYSTEM,
      messages: [{ role: 'user', content: [{ type: 'text', text: 'What I ate: ' + what }] }] }),
  });
  if (!ai.ok) {
    console.error('anthropic text error', ai.status, (await ai.text()).slice(0, 300));
    return json({ error: 'Could not work it out. Try again, or log it by hand.' }, 502);
  }
  const out = await ai.json();
  const reply: string = (out?.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('').trim();
  const result = parseModelJSON(reply);
  if (!result) { console.error('unparseable text reply', reply.slice(0, 300)); return json({ error: 'Could not work it out. Try again, or log it by hand.' }, 502); }
  const kcal = Math.round(Number(result?.estimated_calories ?? 0)) || 0;

  const { error: insErr } = await admin.from('plus_text_logs').insert({ user_id: uid, text: what, kcal });
  if (insErr) console.error('plus_text_logs insert failed', insErr.message);

  return json({ ...result, estimated_calories: kcal, kind: 'text', model: TEXT_MODEL, typed: { today: (count ?? 0) + 1, limit } });
}
