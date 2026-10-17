/* ═══════════════════════════════════════════════════════════════
   HITFAT+ · plus-push
   Bara's reminders, by Web Push. See 38-plus-push.sql.

   GET  ?action=key              the VAPID public key the app subscribes
                                 with; made here (with the private key)
                                 the first time, kept in plus_settings
   POST ?action=send&key=<cron>  the evening run (pg_cron, 8 pm MYT): each
                                 member with a subscription, their day
                                 read from plus_data, at most one message
   POST ?action=test             a signed-in member's own test message
   POST ?action=notify&key=<cron>  { users, title, body, url, tag }: a
                                 message now, for plus-class (a comment on
                                 your post, a reply to your comment); not
                                 counted as the evening's one message

   HITFAT Class members (17 Oct) hear about their class first, from HITFAT
   OS (plus_push_list, 093_wod_push.sql): the membership ending in 7 days,
   3 days, tomorrow, and the day after it ended; a week and two weeks with
   no class; and on the 1st, last month's recap. Personal coaching (098):
   a session tomorrow, the package ending in 3 days. One message an
   evening, these before the habits.

   What Bara says follows the HITFAT Score in the app (score.js): a day's
   score is the share of its habits done (workout, meals /3, water /8,
   steps /8,000, and the fast for a member with an IF plan); a "hari padu"
   is 50 or more; a "kosong" day is 0.

   Deploy:  supabase functions deploy plus-push --no-verify-jwt
            (__OS_ANON__ replaced with HITFAT OS's anon key, as plus-class)
            (the cron call has no JWT; the key and the test's own JWT check
            are the gate)
   ═══════════════════════════════════════════════════════════════ */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: CORS });

type Data = Record<string, any>;

/* the day in Malaysia, as the app writes it */
const MYT = 8 * 3600000;
function dayOf(t: number | string): string { return new Date(new Date(t).getTime() + MYT).toISOString().slice(0, 10); }
function dayBack(n: number): string { return dayOf(Date.now() - n * 86400000); }

const FAST_LIVE = false;

/* Mod Ramadan, as score2.js: approximate dates for Malaysia, or the member's own choice */
const RAMADAN = [['2027-02-08', '2027-03-09'], ['2028-01-28', '2028-02-26'], ['2029-01-16', '2029-02-14']];
function ramadan(d: Data, day: string): boolean {
  const m = (d.sc && d.sc.ram) || 'auto';
  if (m === 'on') return true;
  if (m === 'off') return false;
  return RAMADAN.some(([a, b]) => day >= a && day <= b);
}

function scoreOf(d: Data, day: string, wdays: Record<string, number>): number {
  const dy = (d.daily && d.daily[day]) || {};
  const meals = ((d.meals && d.meals[day]) || []).length;
  const hs: number[] = [
    Math.min(1, wdays[day] || 0),
    Math.min(1, meals / 3),
    Math.min(1, (dy.water || 0) / 8),
    Math.min(1, (dy.steps || 0) / 8000),
  ];
  const f = d.ifs || {};
  if (!FAST_LIVE) { /* the fast is not part of the score for now, as SC_FAST_LIVE in score.js */ }
  else if (ramadan(d, day)) hs.push(dy.ram ? 1 : 0);
  else if (f.plan && !f.plan.blocked) {
    let best = 0, tgt = 16;
    for (const x of (f.log || [])) if (dayOf(x.end) === day && x.hrs > best) { best = x.hrs; tgt = x.target; }
    if (f.active && day === dayBack(0)) { const h = (Date.now() - f.active.at) / 3600000; if (h > best) { best = h; tgt = f.active.target; } }
    hs.push(Math.min(1, best / (tgt || 16)));
  }
  return Math.round(hs.reduce((a, b) => a + b, 0) / hs.length * 100);
}

/* what, if anything, Bara says to this member this evening */
export function messageFor(d: Data): { kind: string; title: string; body: string } | null {
  const wdays: Record<string, number> = {};
  for (const k in (d.sessions || {})) { const s = d.sessions[k]; if (s && s.date) { const dd = dayOf(s.date); wdays[dd] = (wdays[dd] || 0) + 1; } }
  /* a class at HITFAT HQ (kiosk check-in; kelas.js keeps the days in Malaysia) is a workout too */
  for (const dd of ((d as any).kelas?.days || [])) if (typeof dd === 'string') wdays[dd] = (wdays[dd] || 0) + 1;
  const today = scoreOf(d, dayBack(0), wdays);
  let gap = -1;                                            /* empty days before today */
  for (let i = 1; i < 60; i++) if (scoreOf(d, dayBack(i), wdays) > 0) { gap = i - 1; break; }
  if (gap < 0 && today === 0) return null;                 /* never active: a new member */
  let streak = 0;                                          /* strong days up to yesterday; a frozen day keeps the run */
  const frozen = (d.sc && d.sc.frozen) || {};
  for (let i = 1; i < 400; i++) { const day = dayBack(i); if (scoreOf(d, day, wdays) >= 50) streak++; else if (!frozen[day]) break; }

  if (streak >= 2 && today < 50) return {
    kind: 'streak', title: '🔥 Your ' + streak + '-day streak is at risk!',
    body: today ? 'Your score today is only ' + today + '. Reach 50 before bed to save your streak.'
                : 'Nothing logged yet today. A short workout and a glass of water go a long way.',
  };
  /* Sunday: the week's report, Monday to today, against the week before */
  if (new Date(Date.now() + MYT).getUTCDay() === 0) {
    const wk = (o: number) => { const v: number[] = []; for (let i = o; i < o + 7; i++) v.push(scoreOf(d, dayBack(i), wdays)); return v; };
    const now = wk(0), last = wk(7), avg = Math.round(now.reduce((a, b) => a + b, 0) / 7), prev = Math.round(last.reduce((a, b) => a + b, 0) / 7);
    if (now.some(x => x > 0)) {
      const padu = now.filter(x => x >= 50).length, diff = avg - prev;
      return { kind: 'weekly', title: "📊 Bara's weekly report",
        body: 'Average HITFAT Score ' + avg + '/100' + (diff ? (diff > 0 ? ', up ' + diff : ', down ' + (-diff)) : '') + ' · ' + padu + ' strong day' + (padu === 1 ? '' : 's') + '. Open the app for the full report.' };
    }
  }
  if (today >= 50 || today > 0) return null;
  const idle = gap + 1;
  if (idle === 2) return { kind: 'dust', title: 'Bara is getting dusty 😟', body: "Bara hasn't seen you for two days. Log something today before Bara's fur gets all messy tomorrow." };
  if (idle === 3) return { kind: 'rust', title: 'Oh no, Bara is all messy 🥲', body: "A glass of water is enough to fluff Bara up again. Let's go!" };
  if (idle === 7) return { kind: 'rust7', title: 'A week of messy Bara...', body: 'Bara is still waiting for you 🪮 Start again with one small thing today.' };
  if (idle === 14) return { kind: 'rust14', title: 'Bara misses you 🥺', body: "It's been two weeks. It doesn't have to be perfect, just start again." };
  return null;
}

async function vapid(admin: any): Promise<{ pub: string; priv: string }> {
  const { data } = await admin.from('plus_settings').select('key,value').in('key', ['push_vapid_public', 'push_vapid_private']);
  const m: Record<string, string> = {};
  (data || []).forEach((r: any) => { m[r.key] = r.value; });
  if (m.push_vapid_public && m.push_vapid_private) return { pub: m.push_vapid_public, priv: m.push_vapid_private };
  const k = webpush.generateVAPIDKeys();
  /* ignoreDuplicates: two first calls at once keep the first pair */
  await admin.from('plus_settings').upsert([{ key: 'push_vapid_public', value: k.publicKey }, { key: 'push_vapid_private', value: k.privateKey }], { onConflict: 'key', ignoreDuplicates: true });
  return vapid(admin);
}

type Msg = { kind: string; title: string; body: string; url?: string; tag?: string };

/* HITFAT OS, for the class members' end dates and last class */
const OS_URL = 'https://ddcmfbaidkrqpeckmzou.supabase.co';
const OS_ANON = '__OS_ANON__';
async function classList(admin: any): Promise<Record<string, any>> {
  const out: Record<string, any> = {};
  try {
    const { data: k } = await admin.from('plus_settings').select('value').eq('key', 'os_bridge_key').maybeSingle();
    if (!k || !k.value) return out;
    const r = await fetch(OS_URL + '/rest/v1/rpc/plus_push_list', {
      method: 'POST', headers: { apikey: OS_ANON, Authorization: 'Bearer ' + OS_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_key: k.value }) });
    if (!r.ok) { console.warn('plus_push_list', r.status); return out; }
    for (const x of (await r.json()) || []) if (x && x.u) out[x.u] = x;
  } catch (e) { console.warn('plus_push_list', e && (e as Error).message); }
  return out;
}
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function fmtDay(d: string): string { const t = new Date(d + 'T00:00:00Z'); return t.getUTCDate() + ' ' + MONTHS[t.getUTCMonth()].slice(0, 3); }

/* what Bara says to a class member about their class, if anything */
export function classMessage(c: any, today: string): Msg | null {
  if (!c) return null;
  /* personal coaching (098): tomorrow's session, the package nearly used or ending */
  const pt = c.pt;
  if (pt) {
    const coach = pt.coach ? 'Coach ' + String(pt.coach).split(' ')[0] : 'your coach';
    if (pt.next && dayOf(pt.next) === dayOf(Date.parse(today + 'T12:00:00+08:00') + 86400000)) {
      const t = new Date(new Date(pt.next).getTime() + MYT), hh = t.getUTCHours(), mm = String(t.getUTCMinutes()).padStart(2, '0');
      const at = ((hh + 11) % 12 + 1) + ':' + mm + (hh < 12 ? ' AM' : ' PM');
      const left = typeof pt.left === 'number' && pt.left <= 2 ? ' Only ' + pt.left + ' session' + (pt.left === 1 ? '' : 's') + ' left in your package, talk to ' + coach + ' about renewing.' : '';
      return { kind: 'pt1', title: 'PT session tomorrow at ' + at, body: 'With ' + coach + '. Sleep well and eat a good meal before.' + left, url: '/?kelas=today' };
    }
    if (pt.end && daysBetween(today, String(pt.end).slice(0, 10)) === 3)
      return { kind: 'ptend', title: 'Your PT package ends in 3 days', body: 'It ends on ' + fmtDay(String(pt.end).slice(0, 10)) + '. Talk to ' + coach + ' to keep your sessions going.', url: '/?kelas=today' };
  }
  const end = c.end ? String(c.end).slice(0, 10) : '';
  if (end) {
    const left = daysBetween(today, end);
    const renew = 'Renew at the HITFAT counter to keep your classes, points and streak going.';
    if (c.active && left === 7) return { kind: 'end7', title: 'Your class membership ends in 7 days', body: 'It ends on ' + fmtDay(end) + '. ' + renew, url: '/?kelas=today' };
    if (c.active && left === 3) return { kind: 'end3', title: '3 days left on your class membership', body: 'It ends on ' + fmtDay(end) + '. ' + renew, url: '/?kelas=today' };
    if (c.active && left === 1) return { kind: 'end1', title: 'Your class membership ends tomorrow', body: 'Tomorrow is your last day. ' + renew, url: '/?kelas=today' };
    if (!c.active && left === -1) return { kind: 'ended', title: 'Your class membership has ended 😢', body: 'Bara will miss you at class. Renew at the counter and the kiosk lets you in again.', url: '/?kelas=today' };
  }
  if (c.active && c.last) {
    const gap = daysBetween(String(c.last).slice(0, 10), today);
    if (gap === 7) return { kind: 'class7', title: 'Bara misses you at class 🥺', body: "It's been a week since your last class. Your class group is waiting, come back this week!", url: '/?kelas=today' };
    if (gap === 14) return { kind: 'class14', title: 'Two weeks without class...', body: "Bara is still saving your spot. One class this week is all it takes to start again.", url: '/?kelas=today' };
  }
  /* the 1st: last month's recap, for a member who came to class last month */
  if (today.slice(8, 10) === '01' && c.last) {
    const lm = new Date(Date.parse(today + 'T00:00:00Z') - 86400000), name = MONTHS[lm.getUTCMonth()];
    if (daysBetween(String(c.last).slice(0, 10), today) <= 31) return { kind: 'recap', title: '📅 Your ' + name + ' recap is ready', body: 'Your classes, PRs and streak for ' + name + '. Have a look, then share it!', url: '/?kelas=progress' };
  }
  return null;
}

async function sendTo(admin: any, subs: any[], msg: Msg, daily = true) {
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ title: msg.title, body: msg.body, tag: msg.tag || 'bell-' + msg.kind, url: msg.url || '/' }), { TTL: 6 * 3600 });
      sent++;
      if (daily) await admin.from('plus_push_subs').update({ last_sent: dayBack(0), last_kind: msg.kind }).eq('endpoint', s.endpoint);
    } catch (e: any) {
      /* gone: the member removed it, or reinstalled */
      if (e && (e.statusCode === 404 || e.statusCode === 410)) await admin.from('plus_push_subs').delete().eq('endpoint', s.endpoint);
      else console.warn('push failed', e && (e.statusCode || e.message));
    }
  }
  return sent;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const url = new URL(req.url), action = url.searchParams.get('action') || '';
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

  const keys = await vapid(admin);
  if (action === 'key') return json({ key: keys.pub });
  webpush.setVapidDetails('https://app.hitfat.io', keys.pub, keys.priv);

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  if (action === 'test') {
    const auth = req.headers.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    const { data: ud } = token ? await admin.auth.getUser(token) : { data: null };
    const user = ud && ud.user;
    if (!user || !user.id || user.role === 'anon') return json({ error: 'Sign in' }, 401);
    const { data: subs } = await admin.from('plus_push_subs').select('*').eq('user_id', user.id);
    const n = await sendTo(admin, subs || [], { kind: 'test', title: "Hi, it's Bara! 👋", body: 'Reminders are on. Bara will nudge you at 8 pm when there is something to say.' });
    return json({ ok: true, sent: n });
  }

  if (action === 'send') {
    const { data: ck } = await admin.from('plus_settings').select('value').eq('key', 'push_cron_key').maybeSingle();
    if (!ck || url.searchParams.get('key') !== ck.value) return json({ error: 'unauthorised' }, 401);
    const today = dayBack(0);
    const { data: subs } = await admin.from('plus_push_subs').select('*');
    const byUser: Record<string, any[]> = {};
    for (const s of (subs || [])) { if (s.last_sent === today) continue; (byUser[s.user_id] = byUser[s.user_id] || []).push(s); }
    const cls = await classList(admin);
    let users = 0, sent = 0;
    for (const uid of Object.keys(byUser)) {
      let msg: Msg | null = classMessage(cls[uid], today);
      if (!msg) {
        const { data: row } = await admin.from('plus_data').select('data').eq('user_id', uid).maybeSingle();
        msg = row && row.data ? messageFor(row.data) : null;
      }
      if (!msg) continue;
      users++; sent += await sendTo(admin, byUser[uid], msg);
    }
    return json({ ok: true, users, sent });
  }

  /* now, from plus-class: someone answered you in your class group */
  if (action === 'notify') {
    const { data: ck } = await admin.from('plus_settings').select('value').eq('key', 'push_cron_key').maybeSingle();
    if (!ck || url.searchParams.get('key') !== ck.value) return json({ error: 'unauthorised' }, 401);
    const b = await req.json().catch(() => ({}));
    const users = (Array.isArray(b.users) ? b.users : []).filter((u: unknown) => typeof u === 'string' && /^[0-9a-f-]{36}$/.test(u)).slice(0, 5);
    if (!users.length) return json({ ok: true, sent: 0 });
    const msg: Msg = { kind: 'cm', title: String(b.title || 'HITFAT+').slice(0, 80), body: String(b.body || '').slice(0, 160),
      url: typeof b.url === 'string' && b.url.startsWith('/') ? b.url.slice(0, 80) : '/', tag: String(b.tag || 'cm').slice(0, 60) };
    const { data: subs } = await admin.from('plus_push_subs').select('*').in('user_id', users);
    return json({ ok: true, sent: await sendTo(admin, subs || [], msg, false) });
  }

  return json({ error: 'unknown action' }, 400);
});
