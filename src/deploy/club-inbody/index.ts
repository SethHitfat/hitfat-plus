/* ═══════════════════════════════════════════════════════════════
   HITFAT CLUB · club-inbody

   An InBody machine prints a sheet of paper. This reads the sheet and puts
   the numbers where a trend can be drawn through them.

     scan    member → photograph of the printout in, structured row out
     history member → their own scans, newest first

   Two things it deliberately does not do. It does not let the client send
   the numbers — a client that can write club_inbody can write a body fat
   percentage, and the whole point of the machine is that the member cannot
   argue with it. And it does not diagnose: the verdict it returns is about
   training, not health, because a body composition machine is not a doctor
   and neither is this.

   Deploy:  supabase functions deploy club-inbody
   Secrets: supabase secrets set ANTHROPIC_API_KEY=...
   ═══════════════════════════════════════════════════════════════ */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const MODEL = 'claude-opus-5';

/* A printout is dense small type and the numbers matter, so this is one of
   the places where the cheaper model is a false economy. */
const MAX_IMAGE_BYTES = 4_000_000;

/* One member cannot need more than this in a day without something being
   wrong, and every attempt costs money whether or not it parses. */
const MAX_SCANS_PER_DAY = 6;

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

const SYSTEM = `You read InBody body-composition printouts and return their numbers.

Reply with a single JSON object and nothing else. No markdown, no code fence,
no commentary. Use exactly these keys, and use null — never a guess — for any
value that is not legible on the sheet:

{
  "scan_date": "YYYY-MM-DD or null",
  "score": number|null,          // InBody Score, out of 100
  "weight": number|null,         // kg
  "smm": number|null,            // skeletal muscle mass, kg
  "bfm": number|null,            // body fat mass, kg
  "pbf": number|null,            // percent body fat
  "bmi": number|null,
  "vfa": number|null,            // visceral fat area or level
  "bmr": number|null,            // kcal
  "tbw": number|null,            // total body water, litres
  "protein": number|null,        // kg
  "mineral": number|null,        // kg
  "whr": number|null,            // waist-hip ratio
  "smi": number|null,            // skeletal muscle index
  "segmental": {
    "trunk":     { "lean": number|null, "fat": number|null },
    "left_arm":  { "lean": number|null, "fat": number|null },
    "right_arm": { "lean": number|null, "fat": number|null },
    "left_leg":  { "lean": number|null, "fat": number|null },
    "right_leg": { "lean": number|null, "fat": number|null }
  },
  "units": { "weight": "kg", "vfa": "cm2" | "level" },
  "confidence": "high" | "medium" | "low",
  "unreadable": true | false
}

Rules:
- Segmental lean values are in kg. If the sheet gives only a percentage of
  normal, put the kg figure if it is printed and null if it is not.
- InBody sheets vary by model. Missing sections are normal; return null.
- If the photograph is not an InBody sheet at all, set unreadable to true and
  every measurement to null.
- Never carry a number over from a different row because it looks plausible.`;

function num(v: unknown): number | null {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return typeof n === 'number' && isFinite(n) ? n : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405);

  try {
    const auth = req.headers.get('Authorization') || '';
    const jwt = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!jwt) return json({ error: 'Sign in first.' }, 401);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    const user = userData?.user;
    if (userErr || !user || !user.id || user.role === 'anon') {
      return json({ error: 'Sign in first.' }, 401);
    }

    let body: any;
    try { body = await req.json(); }
    catch { return json({ error: 'Bad request body.' }, 400); }

    const action = String(body?.action || 'scan');

    /* Whose scans are these? A member reads their own. A coach reads the
       member they are sitting with, which is the entire reason the console
       can open a client card at all. */
    const { data: me } = await admin.from('club_members')
      .select('role, status').eq('user_id', user.id).maybeSingle();
    const isStaff = !!me && ['coach', 'staff', 'admin'].includes(me.role);
    const asked = String(body?.user_id || '');
    const target = (asked && isStaff) ? asked : user.id;

    if (action === 'history') {
      const { data, error } = await admin.from('club_inbody')
        .select('id, scan_date, score, weight, smm, bfm, pbf, bmi, vfa, bmr, tbw, protein, mineral, whr, smi, segmental')
        .eq('user_id', target).order('scan_date', { ascending: false }).limit(24);
      if (error) return json({ error: 'Could not load your scans.' }, 503);
      return json({ ok: true, scans: data || [] });
    }

    if (action !== 'scan') return json({ error: 'Unknown action.' }, 400);
    if (!me) return json({ error: 'You are not a Club member.' }, 403);

    /* ── rate limit before spending ─────────────────────────── */
    const dayAgo = new Date(Date.now() - 86400_000).toISOString();
    const { count } = await admin.from('club_inbody')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', target).gte('created_at', dayAgo);
    if ((count ?? 0) >= MAX_SCANS_PER_DAY) {
      return json({ error: 'That is a lot of scans for one day. Try again tomorrow.' }, 429);
    }

    const b64: string = String(body?.image_base64 || '').replace(/^data:image\/\w+;base64,/, '');
    if (!b64)                         return json({ error: 'No image received.' }, 400);
    if (b64.length > MAX_IMAGE_BYTES) return json({ error: 'Image too large.' }, 413);
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) return json({ error: 'Image is not valid base64.' }, 400);

    const mediaType = /^image\/(jpeg|png|webp)$/.test(String(body?.media_type || ''))
      ? String(body.media_type) : 'image/jpeg';

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'InBody scan is not configured yet.' }, 500);

    const ai = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: SYSTEM,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: b64 } },
            { type: 'text',  text: 'Read every number you can see on this InBody sheet.' },
          ],
        }],
      }),
    });

    if (!ai.ok) {
      console.error('anthropic error', ai.status, (await ai.text()).slice(0, 400));
      return json({ error: 'Could not read that sheet. Try a straighter, brighter photo.' }, 502);
    }

    const out = await ai.json();
    const text: string = (out?.content || [])
      .filter((c: any) => c.type === 'text').map((c: any) => c.text).join('').trim();

    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    let r: any;
    try { r = JSON.parse(cleaned); }
    catch {
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (!m) return json({ error: 'Could not read that sheet. Try a clearer photo.' }, 502);
      try { r = JSON.parse(m[0]); }
      catch { return json({ error: 'Could not read that sheet. Try a clearer photo.' }, 502); }
    }

    if (r?.unreadable === true) {
      return json({ error: 'That does not look like an InBody sheet.', code: 'unreadable' }, 422);
    }

    /* A row with no weight and no body fat is not a scan, it is a photograph
       of a wall. Saving it would put a gap in the trend line that looks like
       a measurement. */
    const weight = num(r?.weight), pbf = num(r?.pbf);
    if (weight === null && pbf === null) {
      return json({ error: 'No readable numbers on that sheet.', code: 'unreadable' }, 422);
    }

    /* Date on the sheet wins; the day the photo was taken is the fallback.
       Getting this wrong puts today's scan a month back in the trend. */
    let scanDate = String(r?.scan_date || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scanDate)) scanDate = new Date().toISOString().slice(0, 10);

    const row = {
      user_id: target,
      scan_date: scanDate,
      score: num(r?.score), weight, smm: num(r?.smm), bfm: num(r?.bfm), pbf,
      bmi: num(r?.bmi), vfa: num(r?.vfa), bmr: num(r?.bmr), tbw: num(r?.tbw),
      protein: num(r?.protein), mineral: num(r?.mineral), whr: num(r?.whr), smi: num(r?.smi),
      segmental: r?.segmental ?? null,
      raw: r,
    };

    /* One scan a day replaces rather than stacks — the unique index says so,
       and a member who photographs the same sheet twice should not get two
       points on the chart a millimetre apart. */
    const { data: saved, error: sErr } = await admin.from('club_inbody')
      .upsert(row, { onConflict: 'user_id,scan_date' })
      .select('id, scan_date, score, weight, smm, bfm, pbf, bmi, vfa, bmr, tbw, protein, mineral, whr, smi, segmental')
      .maybeSingle();
    if (sErr) {
      console.error('club_inbody upsert failed', sErr.message);
      return json({ error: 'Read the sheet but could not save it.' }, 503);
    }

    /* First scan earns the "Know your numbers" mission.
       Counting the member's scans is not enough to decide this. The upsert
       above replaces a same-day row, so photographing one sheet twice on the
       same morning leaves the count at 1 both times and pays the bonus
       twice. Ask the ledger whether it has already been paid instead — that
       is the question actually being asked. */
    const { count: paid } = await admin.from('club_points')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', target).eq('description', 'First InBody scan');
    if ((paid ?? 0) === 0 && saved) {
      await admin.from('club_points').insert({
        user_id: target, amount: 50, kind: 'manual',
        reference_id: saved.id, description: 'First InBody scan',
      });
    }

    return json({ ok: true, scan: saved, confidence: r?.confidence || 'medium' });

  } catch (e) {
    console.error('club-inbody crashed', e);
    return json({ error: 'Scan failed. Try again.' }, 500);
  }
});
