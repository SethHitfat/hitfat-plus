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
        .eq('user_id', uid).gt('at', since);
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
      return json({ ...st, until });
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
