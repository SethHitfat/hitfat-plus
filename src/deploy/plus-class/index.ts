/* ═══════════════════════════════════════════════════════════════
   HITFAT+ · plus-class
   The physical class member's bridge to HITFAT OS (os.hitfat.io).

   A member of a physical class (HITFAT Active Class, Ladies Only, Mens
   Only, HYROX; RM250 a month at HITFAT HQ) gets All Access in HITFAT+ for
   as long as that membership runs. They connect with their phone number
   only, the number the counter already has.

   POST { action:'lookup', phone }   is this number a class member?
                                     a masked name, the class, the end date
   POST { action:'claim',  phone }   connect it to this account, grant access
   POST { action:'status' }          the Class screen: membership, schedule,
                                     check-ins; and keeps access in step
                                     with the end date
   POST { action:'unlink' }          disconnect, end the access
   POST { action:'goal', goal }      FIRST 30: the member's goal, to OS
                                     members.goal unless the coach set one
   POST { action:'inbody', image_base64, media_type }
                                     a photograph of the InBody printout,
                                     read by Claude, saved in HITFAT OS
                                     (inbody_scans, and the headline numbers
                                     in client_metrics for the coach)
   POST { action:'cm_feed', cat }    Community: the group's feed, the weekly
                                     and monthly class boards, my choices
   POST { action:'cm_post', move, value }   a personal record to the group
   POST { action:'cm_react', post, emoji }  fire / clap / muscle, on and off
   POST { action:'cm_pref', hide_board, hide_feed }
   POST { action:'cm_admin', op, post, cat, title, body }
                                     announce, pin, hide: admins only, the
                                     HITFAT+ user ids in plus_settings
                                     'cm_admin_ids' (086_community.sql)

   HITFAT OS is another Supabase project. Its four plus_* functions refuse
   anything without the bridge key, which lives here in plus_settings
   (39-plus-class.sql); OS keeps only its sha256 (080_plus_bridge.sql).

   One number, one account: OS refuses a second account for a number that
   is already connected ('taken'). Staff release it from OS.

   Access is a plus_entitlements pass with sku 'sub_plus_class', so the
   app and scan-food treat it exactly like a HITFAT+ membership. It runs
   to the end of the class membership's last day in Malaysia, and is
   moved on every status call: renewed at the counter, it follows; ended
   or disconnected, it stops.

   Deploy:  supabase functions deploy plus-class   (JWT verified)
   ═══════════════════════════════════════════════════════════════ */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const OS_URL = 'https://ddcmfbaidkrqpeckmzou.supabase.co';
/* HITFAT OS's anon key. Public by design: it ships in every os.hitfat.io
   page. It is not what protects the plus_* functions; the bridge key is. */
const OS_ANON = '__OS_ANON__';

const SKU = 'sub_plus_class';
const LOOKUPS_PER_HOUR = 8;

/* InBody: dense small print where every digit matters, so the strongest
   model. Four sheets a day is more than any member needs; every attempt
   costs money whether or not it reads. */
const INBODY_MODEL = 'claude-opus-5-5';
const INBODY_PER_DAY = 4;
const MAX_IMAGE_B64 = 5_500_000;

const INBODY_SYSTEM = `You read InBody body-composition result sheets (InBody 120, 270, 370, 570, 770, 970 and similar) and return their numbers.

Reply with one JSON object and nothing else: no markdown, no code fence, no commentary. Use exactly these keys. Use null, never a guess, for any value that is not printed or not legible. Numbers are plain numbers (no units, no strings).

{
  "scan_date": "YYYY-MM-DD" | null,
  "model": string | null,
  "height_cm": number | null, "age": number | null, "sex": "male" | "female" | null,
  "weight": number | null,          // kg
  "tbw": number | null,             // total body water, L
  "protein": number | null,         // kg
  "mineral": number | null,         // kg
  "bfm": number | null,             // body fat mass, kg
  "ffm": number | null,             // fat free mass, kg
  "smm": number | null,             // skeletal muscle mass, kg
  "pbf": number | null,             // percent body fat
  "bmi": number | null,
  "ranges": {                        // the printed normal range for each, [low, high]
    "weight": [number, number] | null, "smm": [number, number] | null, "bfm": [number, number] | null,
    "pbf": [number, number] | null, "bmi": [number, number] | null
  },
  "score": number | null,           // InBody Score, out of 100
  "target_weight": number | null, "weight_control": number | null,
  "fat_control": number | null, "muscle_control": number | null,   // kg, signed as printed (+/-)
  "vfl": number | null,             // visceral fat level
  "vfa": number | null,             // visceral fat area, cm2
  "bmr": number | null,             // kcal
  "whr": number | null,             // waist-hip ratio
  "smi": number | null,             // skeletal muscle index, kg/m2
  "ecw_ratio": number | null,       // ECW/TBW
  "seg_lean": { "right_arm": {"kg": n|null, "pct": n|null}, "left_arm": {...}, "trunk": {...}, "right_leg": {...}, "left_leg": {...} } | null,
  "seg_fat":  { "right_arm": {"kg": n|null, "pct": n|null}, "left_arm": {...}, "trunk": {...}, "right_leg": {...}, "left_leg": {...} } | null,
  "confidence": "high" | "medium" | "low",
  "unreadable": true | false
}

Rules:
- pct in seg_lean and seg_fat is the percentage of normal printed under each segment (e.g. 104.3), not a body fat percentage.
- Sheets differ by model; a missing section is normal, return null for it.
- Never carry a number over from another row because it looks plausible.
- If the photograph is not an InBody result sheet, set unreadable to true and every measurement to null.`;

function num(v: unknown): number | null {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return typeof n === 'number' && isFinite(n) ? n : null;
}
function pair(v: unknown): [number, number] | null {
  if (!Array.isArray(v) || v.length !== 2) return null;
  const a = num(v[0]), b = num(v[1]);
  return a !== null && b !== null && a < b ? [a, b] : null;
}
function segs(v: any) {
  if (!v || typeof v !== 'object') return null;
  const out: Record<string, { kg: number | null; pct: number | null }> = {};
  let any = false;
  for (const k of ['right_arm', 'left_arm', 'trunk', 'right_leg', 'left_leg']) {
    const kg = num(v?.[k]?.kg), pct = num(v?.[k]?.pct);
    out[k] = { kg, pct };
    if (kg !== null || pct !== null) any = true;
  }
  return any ? out : null;
}
/* Only the keys the app knows, every number checked, nothing else kept. */
function clean(r: any) {
  const N = ['height_cm', 'age', 'weight', 'tbw', 'protein', 'mineral', 'bfm', 'ffm', 'smm', 'pbf', 'bmi', 'score',
    'target_weight', 'weight_control', 'fat_control', 'muscle_control', 'vfl', 'vfa', 'bmr', 'whr', 'smi', 'ecw_ratio'];
  const d: Record<string, unknown> = {};
  for (const k of N) { const v = num(r?.[k]); if (v !== null) d[k] = v; }
  if (typeof r?.model === 'string') d.model = r.model.slice(0, 40);
  if (r?.sex === 'male' || r?.sex === 'female') d.sex = r.sex;
  const rg: Record<string, [number, number]> = {};
  for (const k of ['weight', 'smm', 'bfm', 'pbf', 'bmi']) { const p = pair(r?.ranges?.[k]); if (p) rg[k] = p; }
  if (Object.keys(rg).length) d.ranges = rg;
  const sl = segs(r?.seg_lean), sf = segs(r?.seg_fat);
  if (sl) d.seg_lean = sl;
  if (sf) d.seg_fat = sf;
  d.confidence = ['high', 'medium', 'low'].includes(r?.confidence) ? r.confidence : 'medium';
  return d;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

async function os(fn: string, body: Record<string, unknown>) {
  const r = await fetch(OS_URL + '/rest/v1/rpc/' + fn, {
    method: 'POST',
    headers: { apikey: OS_ANON, Authorization: 'Bearer ' + OS_ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('os ' + fn + ' ' + r.status);
  return await r.json();
}

/* The end date is the last day of the membership, in Malaysia: access
   runs to midnight after it, MYT. */
function endOfDayMY(d: string): string {
  return new Date(Date.parse(d + 'T00:00:00+08:00') + 864e5).toISOString();
}

async function syncAccess(admin: any, uid: string, st: any) {
  const ends = (st && st.linked ? st.memberships || [] : [])
    .filter((m: any) => m.active && m.end_date).map((m: any) => String(m.end_date)).sort();
  const until = ends.length ? endOfDayMY(ends[ends.length - 1]) : null;
  const { data: rows } = await admin.from('plus_entitlements')
    .select('id, expires_at').eq('user_id', uid).eq('sku', SKU);
  const now = new Date().toISOString();
  if (until) {
    const src = 'os:' + st.member_id;
    if (rows && rows.length) {
      await admin.from('plus_entitlements').update({ expires_at: until, source: src }).eq('id', rows[0].id);
      if (rows.length > 1) await admin.from('plus_entitlements').delete().in('id', rows.slice(1).map((r: any) => r.id));
    } else {
      await admin.from('plus_entitlements').insert({ user_id: uid, sku: SKU, kind: 'pass', expires_at: until, source: src });
    }
  } else if (rows && rows.some((r: any) => !r.expires_at || r.expires_at > now)) {
    await admin.from('plus_entitlements').update({ expires_at: now }).eq('user_id', uid).eq('sku', SKU);
  }
  return until;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const auth = req.headers.get('Authorization') || '';
    const jwt = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!jwt) return json({ error: 'Sign in first.' }, 401);

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } });
    const { data: u, error: uErr } = await admin.auth.getUser(jwt);
    if (uErr || !u || !u.user) return json({ error: 'Sign in first.' }, 401);
    const uid = u.user.id;

    const { data: k } = await admin.from('plus_settings').select('value').eq('key', 'os_bridge_key').maybeSingle();
    if (!k || !k.value) return json({ error: 'not_ready' }, 503);
    const key = k.value;

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');
    const phone = String(body.phone || '').replace(/[^\d+]/g, '').slice(0, 16);

    if (action === 'lookup') {
      const since = new Date(Date.now() - 3600e3).toISOString();
      const { count } = await admin.from('plus_class_tries').select('*', { count: 'exact', head: true })
        .eq('user_id', uid).eq('kind', 'lookup').gt('at', since);
      if ((count || 0) >= LOOKUPS_PER_HOUR) return json({ error: 'too_many' }, 429);
      await admin.from('plus_class_tries').insert({ user_id: uid });
      const r = await os('plus_lookup', { p_key: key, p_phone: phone });
      if (!r || !r.found) return json({ found: false });
      return json({
        found: true, name: r.name, category: r.category, end_date: r.end_date, active: !!r.active,
        mine: r.linked_to === uid, taken: !!r.linked_to && r.linked_to !== uid,
      });
    }

    if (action === 'claim') {
      const r = await os('plus_claim', { p_key: key, p_phone: phone, p_user: uid });
      if (!r || !r.ok) return json({ ok: false, error: (r && r.error) || 'failed' });
      const st = await os('plus_status', { p_key: key, p_user: uid });
      const until = await syncAccess(admin, uid, st);
      return json({ ok: true, until, status: st });
    }

    if (action === 'status') {
      const st = await os('plus_status', { p_key: key, p_user: uid });
      const until = await syncAccess(admin, uid, st);
      /* FIRST 30 done: +300 and a post in the class group, once (088) */
      if (st && st.first30 && st.first30.complete && !st.first30.awarded) {
        try { const a = await os('plus_first30_award', { p_key: key, p_user: uid }); if (a && a.ok) st.first30.awarded = true; } catch (_) { /* next time */ }
      }
      return json({ ...st, until });
    }

    if (action === 'goal') {
      return json(await os('plus_set_goal', { p_key: key, p_user: uid, p_goal: String(body.goal || '').slice(0, 60) }));
    }

    if (action === 'inbody') {
      const st = await os('plus_status', { p_key: key, p_user: uid });
      if (!st || !st.linked) return json({ error: 'not_linked' }, 403);

      const dayAgo = new Date(Date.now() - 86400e3).toISOString();
      const { count } = await admin.from('plus_class_tries').select('*', { count: 'exact', head: true })
        .eq('user_id', uid).eq('kind', 'inbody').gt('at', dayAgo);
      if ((count || 0) >= INBODY_PER_DAY) return json({ error: 'too_many' }, 429);

      const b64 = String(body.image_base64 || '').replace(/^data:image\/\w+;base64,/, '');
      if (!b64) return json({ error: 'no_image' }, 400);
      if (b64.length > MAX_IMAGE_B64) return json({ error: 'too_large' }, 413);
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) return json({ error: 'bad_image' }, 400);
      const mediaType = /^image\/(jpeg|png|webp)$/.test(String(body.media_type || '')) ? String(body.media_type) : 'image/jpeg';
      const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!apiKey) return json({ error: 'not_ready' }, 503);
      await admin.from('plus_class_tries').insert({ user_id: uid, kind: 'inbody' });

      const ai = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: INBODY_MODEL, max_tokens: 2000, system: INBODY_SYSTEM,
          messages: [{ role: 'user', content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: b64 } },
            { type: 'text', text: 'Read every number on this InBody result sheet.' },
          ] }],
        }),
      });
      if (!ai.ok) { console.error('inbody anthropic', ai.status, (await ai.text()).slice(0, 300)); return json({ error: 'unread' }, 502); }
      const out = await ai.json();
      const text = String((out?.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('')).trim()
        .replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      let r: any = null;
      try { r = JSON.parse(text); } catch { const m = text.match(/\{[\s\S]*\}/); if (m) { try { r = JSON.parse(m[0]); } catch { r = null; } } }
      if (!r) return json({ error: 'unread' }, 502);
      if (r.unreadable === true) return json({ error: 'not_inbody' }, 422);
      const d = clean(r);
      if (d.weight === undefined && d.pbf === undefined) return json({ error: 'not_inbody' }, 422);

      /* the date printed on the sheet; today in Malaysia when it is not legible,
         or when it reads as a day in the future */
      const todayMY = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
      let scanDate = String(r.scan_date || '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(scanDate) || scanDate > todayMY || scanDate < '2015-01-01') scanDate = todayMY;

      const sv = await os('plus_inbody_save', { p_key: key, p_user: uid, p_date: scanDate, p_data: d });
      if (!sv || !sv.ok) return json({ error: (sv && sv.error) || 'failed' }, 500);
      return json({ ok: true, scan: { ...d, scan_date: scanDate, src: 'sheet' } });
    }

    if (action.startsWith('cm_')) {
      const { data: ad } = await admin.from('plus_settings').select('value').eq('key', 'cm_admin_ids').maybeSingle();
      const isAdmin = !!ad && String(ad.value || '').split(/[\s,]+/).includes(uid);
      if (action === 'cm_feed') return json(await os('plus_cm_feed', { p_key: key, p_user: uid, p_cat: String(body.cat || ''), p_admin: isAdmin }));
      if (action === 'cm_post') return json(await os('plus_cm_post', { p_key: key, p_user: uid, p_move: String(body.move || '').slice(0, 40), p_value: String(body.value || '').slice(0, 16) }));
      if (action === 'cm_react') {
        if (!/^[0-9a-f-]{36}$/.test(String(body.post || ''))) return json({ ok: false });
        return json(await os('plus_cm_react', { p_key: key, p_user: uid, p_post: String(body.post), p_emoji: String(body.emoji || '') }));
      }
      if (action === 'cm_pref') return json(await os('plus_cm_pref', { p_key: key, p_user: uid, p_hide_board: !!body.hide_board, p_hide_feed: !!body.hide_feed }));
      if (action === 'cm_admin') {
        if (!isAdmin) return json({ error: 'admins only' }, 403);
        const post = /^[0-9a-f-]{36}$/.test(String(body.post || '')) ? String(body.post) : null;
        return json(await os('plus_cm_admin', { p_key: key, p_action: String(body.op || ''), p_post: post,
          p_cat: String(body.cat || ''), p_title: String(body.title || '').slice(0, 120), p_body: String(body.body || '').slice(0, 1000) }));
      }
    }

    if (action === 'unlink') {
      await os('plus_unlink', { p_key: key, p_user: uid });
      await syncAccess(admin, uid, { linked: false });
      return json({ ok: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (e) {
    console.error('plus-class', e && (e as Error).message);
    return json({ error: 'failed' }, 500);
  }
});
