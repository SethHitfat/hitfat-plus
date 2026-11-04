/* ═══════════════════════════════════════════════════════════════
   HITFAT+ · plus-watch, the watchdog (4 Nov 2026)

   Seth: "kadang-kadang aku tak sempat nak tengok apa semua, sekurangnya
   mungkin dia check". It only looks and tells Seth: it never messages a
   buyer, refunds or changes anything. Pushes go through plus-push
   ?action=notify to the people in plus_sale_alert_to (Seth), and tapping
   one opens the HITFAT+ report in OS.

   ?mode=red    every 15 minutes (55-plus-watch.sql), each alert once:
                - paid but no access: an app order paid with no entitlement,
                  or a landing order paid with no purchase row
                - stuck pending: 30 minutes with no answer from Bayarcash,
                  counted per person (phone or email, or the app account),
                  and skipped when that person has paid since
                - a site down (checked twice), and again when it is back
   ?mode=daily  9 am Malaysia: yesterday's sales, who is still pending,
                who paid but has not opened MAK2FIT, sites, paid-no-access
   &dry=1       answers with what it would send and sends nothing

   Gate: ?key= plus_settings.push_cron_key, as plus-push. Deploy with
   verify_jwt off; the cron call has no JWT.
   ═══════════════════════════════════════════════════════════════ */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });

const SITES = ['https://app.hitfat.io/', 'https://app.hitfat.io/ladies/', 'https://os.hitfat.io/'];
const LABEL: Record<string, string> = {
  prog_lad4: 'MAK2FIT 30', prog_wl30: 'BURN30', prog_d6: 'DIET 6 MINGGU', prog_ay30: 'AYAH2FIT 30', bundle_all: 'Bundle',
  sub_plus_6m: 'HITFAT+ 6b', sub_plus_12m: 'HITFAT+ 12b', sub_coach_6m: 'Coach 6b', sub_coach_12m: 'Coach 12b',
};
const MYT = 8 * 3600000;
const ago = (min: number) => new Date(Date.now() - min * 60000).toISOString();
const first = (s: unknown) => String(s || '').trim().split(/\s+/)[0].toLowerCase().replace(/^./, (c) => c.toUpperCase()).slice(0, 14) || '?';
const names = (a: string[], n = 3) => a.slice(0, n).join(', ') + (a.length > n ? ' +' + (a.length - n) : '');
/* one person: the last 9 digits of the phone, else the email */
const who = (o: any) => { const p = String(o.phone || '').replace(/\D/g, ''); return p.length >= 9 ? 'p' + p.slice(-9) : 'e' + String(o.email || '').toLowerCase(); };

async function siteDown(url: string): Promise<string | null> {
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(10000) });
      await r.body?.cancel();
      if (r.ok) return null;
      if (i) return 'HTTP ' + r.status;
    } catch (e) {
      if (i) return String((e as Error).name || 'error');
    }
    await new Promise((res) => setTimeout(res, 5000));
  }
  return 'error';
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data: ck } = await db.from('plus_settings').select('value').eq('key', 'push_cron_key').maybeSingle();
  if (!ck || url.searchParams.get('key') !== ck.value) return json({ error: 'unauthorised' }, 401);
  const mode = url.searchParams.get('mode') === 'daily' ? 'daily' : 'red';
  const dry = url.searchParams.get('dry') === '1';

  const msgs: { title: string; body: string; tag: string }[] = [];
  const marks: string[] = [], unmarks: string[] = [];

  /* what has been told already */
  const { data: seenRows } = await db.from('plus_watch_seen').select('key');
  const seen = new Set((seenRows || []).map((r: any) => r.key));

  /* ── paid but no access ── */
  const noAccess: string[] = [];
  const { data: appPaid } = await db.from('plus_orders').select('order_number, user_id, sku').eq('status', 'paid').gte('paid_at', ago(7 * 1440));
  const appProg = (appPaid || []).filter((o: any) => !String(o.sku).startsWith('t42:'));
  if (appProg.length) {
    const { data: ents } = await db.from('plus_entitlements').select('source').in('source', appProg.map((o: any) => o.order_number));
    const has = new Set((ents || []).map((e: any) => e.source));
    for (const o of appProg) if (!has.has(o.order_number)) noAccess.push(o.order_number + ' ' + (LABEL[o.sku] || o.sku) + ' (app)');
  }
  const { data: landPaid } = await db.from('plus_landing_orders').select('order_number, sku, name').eq('status', 'paid').gte('paid_at', ago(7 * 1440));
  if (landPaid && landPaid.length) {
    const { data: pur } = await db.from('plus_landing_purchases').select('order_number').in('order_number', landPaid.map((o: any) => o.order_number));
    const has = new Set((pur || []).map((p: any) => p.order_number));
    for (const o of landPaid) if (!has.has(o.order_number)) noAccess.push(o.order_number + ' ' + first(o.name) + ' (landing)');
  }

  /* ── stuck pending, per person, not paid since ── */
  const since = mode === 'daily' ? ago(48 * 60) : ago(6 * 60);
  const { data: lp } = await db.from('plus_landing_orders').select('order_number, sku, name, phone, email, status, created_at').gte('created_at', ago(9 * 1440));
  const paidBy = new Set((lp || []).filter((o: any) => o.status === 'paid').map((o: any) => who(o) + o.sku));
  const stuck = new Map<string, { name: string; key: string; at: string }>();
  for (const o of (lp || [])) {
    const t = Date.parse(o.created_at);
    if (o.status !== 'pending' || t < Date.parse(since) || t > Date.now() - 30 * 60000) continue;
    const p = who(o);
    if (paidBy.has(p + o.sku)) continue;
    stuck.set(p + o.sku, { name: first(o.name) + ' · ' + (LABEL[o.sku] || o.sku), key: 'pend:' + p + o.sku, at: o.created_at });
  }
  const { data: ap } = await db.from('plus_orders').select('order_number, user_id, sku, status, created_at').eq('status', 'pending')
    .gte('created_at', since).lte('created_at', ago(30));
  for (const o of (ap || [])) {
    if (String(o.sku).startsWith('t42:')) continue;
    const { count } = await db.from('plus_entitlements').select('id', { count: 'exact', head: true }).eq('user_id', o.user_id).eq('sku', o.sku);
    if (count) continue;
    const { data: u } = await db.auth.admin.getUserById(o.user_id);
    const m = (u && u.user && u.user.user_metadata) || {};
    const nm = m.name || m.full_name || (u && u.user && u.user.email) || '?';
    stuck.set('u' + o.user_id + o.sku, { name: first(nm) + ' · ' + (LABEL[o.sku] || o.sku) + ' (app)', key: 'pend:u' + o.user_id + o.sku, at: o.created_at });
  }

  /* ── sites ── */
  const down: { url: string; why: string }[] = [], back: string[] = [];
  const checks = await Promise.all(SITES.map(async (s) => ({ s, why: await siteDown(s) })));
  for (const c of checks) {
    const k = 'site:' + c.s;
    if (c.why) { down.push({ url: c.s, why: c.why }); if (!seen.has(k)) marks.push(k); }
    else if (seen.has(k)) { back.push(c.s); unmarks.push(k); }
  }
  const short = (s: string) => s.replace('https://', '').replace(/\/$/, '');

  if (mode === 'red') {
    const newNo = noAccess.filter((x) => !seen.has('noacc:' + x.split(' ')[0]));
    if (newNo.length) {
      msgs.push({ title: '🔴 Dah bayar, tiada akses: ' + newNo.length, body: newNo.join(' · '), tag: 'watch-noacc' });
      newNo.forEach((x) => marks.push('noacc:' + x.split(' ')[0]));
    }
    const newSt = [...stuck.values()].filter((s) => !seen.has(s.key));
    if (newSt.length) {
      msgs.push({ title: '⏳ Pending lebih 30 minit: ' + newSt.length + ' orang', body: names(newSt.map((s) => s.name)) + '. Belum bayar, belum gagal.', tag: 'watch-pend' });
      newSt.forEach((s) => marks.push(s.key));
    }
    const newDown = down.filter((d) => !seen.has('site:' + d.url));
    if (newDown.length) msgs.push({ title: '🚨 Laman tak boleh dibuka', body: newDown.map((d) => short(d.url) + ' (' + d.why + ')').join(' · '), tag: 'watch-site' });
    if (back.length) msgs.push({ title: '✅ Laman dah pulih', body: back.map(short).join(' · '), tag: 'watch-site' });
  } else {
    /* yesterday in Malaysia */
    const today0 = new Date(Math.floor((Date.now() + MYT) / 86400000) * 86400000 - MYT);
    const y0 = new Date(today0.getTime() - 86400000).toISOString(), y1 = today0.toISOString();
    const { data: ly } = await db.from('plus_landing_orders').select('amount').eq('status', 'paid').gte('paid_at', y0).lt('paid_at', y1);
    const { data: ay } = await db.from('plus_orders').select('amount').eq('status', 'paid').gte('paid_at', y0).lt('paid_at', y1);
    const sales = [...(ly || []), ...(ay || [])];
    const rm = sales.reduce((t: number, o: any) => t + Number(o.amount || 0), 0);
    /* paid, not opened: MAK2FIT bought on the landing page in the last 14 days, a day old, never claimed */
    const { data: un } = await db.from('plus_landing_purchases').select('name').is('claimed_by', null).eq('source', 'landing')
      .gte('created_at', ago(14 * 1440)).lt('created_at', ago(1440)).order('created_at', { ascending: false });
    const st = [...stuck.values()];
    const parts = [
      'Semalam ' + sales.length + ' jualan, RM' + Math.round(rm),
      'Pending ' + st.length + (st.length ? ' (' + names(st.map((s) => s.name.split(' · ')[0])) + ')' : ''),
      'Belum tuntut ' + (un || []).length + ((un || []).length ? ' (' + names((un || []).map((p: any) => first(p.name)), 2) + ')' : ''),
      down.length ? 'Laman DOWN: ' + down.map((d) => short(d.url)).join(', ') : 'Laman OK',
    ];
    if (noAccess.length) parts.unshift('🔴 Tiada akses ' + noAccess.length);
    msgs.push({ title: '☀️ HITFAT+ pagi ini', body: parts.join(' · '), tag: 'watch-daily-' + y1.slice(0, 10) });
  }

  if (dry) return json({ mode, msgs, noAccess, stuck: [...stuck.values()], down, back });

  let sent = 0;
  if (msgs.length) {
    const { data: to } = await db.from('plus_sale_alert_to').select('user_id');
    const users = (to || []).map((r: any) => r.user_id);
    for (const m of msgs) {
      const r = await fetch(Deno.env.get('SUPABASE_URL') + '/functions/v1/plus-push?action=notify&key=' + encodeURIComponent(ck.value), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users, title: m.title.slice(0, 80), body: m.body.slice(0, 160), url: '/os', tag: m.tag }),
      }).catch(() => null);
      const d = r ? await r.json().catch(() => null) : null;
      sent += (d && d.sent) || 0;
    }
  }
  /* remembered only once the push has gone, so a failed send tries again next time */
  if (marks.length && (sent || !msgs.length)) await db.from('plus_watch_seen').upsert(marks.map((key) => ({ key })), { onConflict: 'key', ignoreDuplicates: true });
  if (unmarks.length && (sent || !msgs.length)) await db.from('plus_watch_seen').delete().in('key', unmarks);
  return json({ mode, msgs: msgs.length, sent });
});
