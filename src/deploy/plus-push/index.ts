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
    kind: 'streak', title: '🔥 Streak ' + streak + ' hari awak dalam bahaya!',
    body: today ? 'Skor awak hari ni baru ' + today + '. Capai 50 sebelum tidur untuk selamatkan streak, Bara tunggu!'
                : 'Belum ada log hari ni. Workout pendek dan segelas air pun dah banyak membantu.',
  };
  /* Sunday: the week's report, Monday to today, against the week before */
  if (new Date(Date.now() + MYT).getUTCDay() === 0) {
    const wk = (o: number) => { const v: number[] = []; for (let i = o; i < o + 7; i++) v.push(scoreOf(d, dayBack(i), wdays)); return v; };
    const now = wk(0), last = wk(7), avg = Math.round(now.reduce((a, b) => a + b, 0) / 7), prev = Math.round(last.reduce((a, b) => a + b, 0) / 7);
    if (now.some(x => x > 0)) {
      const padu = now.filter(x => x >= 50).length, diff = avg - prev;
      return { kind: 'weekly', title: '📊 Laporan mingguan Bara',
        body: 'Purata HITFAT Score ' + avg + '/100' + (diff ? (diff > 0 ? ', naik ' + diff : ', turun ' + (-diff)) : '') + ' · ' + padu + ' hari padu. Buka app untuk laporan penuh.' };
    }
  }
  if (today >= 50 || today > 0) return null;
  const idle = gap + 1;
  if (idle === 2) return { kind: 'dust', title: 'Bara dah berhabuk 😟', body: 'Dah dua hari Bara tak nampak awak. Log satu benda hari ni sebelum bulu Bara kusut esok.' };
  if (idle === 3) return { kind: 'rust', title: 'Alamak, bulu Bara dah kusut 🥲', body: 'Segelas air pun cukup untuk buat Bara gebu balik. Jom!' };
  if (idle === 7) return { kind: 'rust7', title: 'Seminggu Bara kusut...', body: 'Bara masih tunggu awak 🪮 Mula balik dengan satu benda kecil hari ni.' };
  if (idle === 14) return { kind: 'rust14', title: 'Bara rindu awak 🥺', body: 'Dah dua minggu. Tak perlu sempurna, mula je balik.' };
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
const MONTHS = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
function fmtDay(d: string): string { const t = new Date(d + 'T00:00:00Z'); return t.getUTCDate() + ' ' + MONTHS[t.getUTCMonth()]; }

/* what Bara says to a class member about their class, if anything */
export function classMessage(c: any, today: string): Msg | null {
  if (!c) return null;
  /* personal coaching (098): tomorrow's session, the package nearly used or ending */
  const pt = c.pt;
  if (pt) {
    const coach = pt.coach ? 'Coach ' + String(pt.coach).split(' ')[0] : 'coach awak';
    if (pt.next && dayOf(pt.next) === dayOf(Date.parse(today + 'T12:00:00+08:00') + 86400000)) {
      const t = new Date(new Date(pt.next).getTime() + MYT), hh = t.getUTCHours(), mm = String(t.getUTCMinutes()).padStart(2, '0');
      const at = ((hh + 11) % 12 + 1) + ':' + mm + (hh < 12 ? ' pagi' : hh < 19 ? ' petang' : ' malam');
      const left = typeof pt.left === 'number' && pt.left <= 2 ? ' Tinggal ' + pt.left + ' sesi dalam pakej awak, cakap dengan ' + coach + ' untuk sambung.' : '';
      return { kind: 'pt1', title: 'Sesi PT esok pukul ' + at, body: 'Dengan ' + coach + '. Tidur cukup dan makan elok sebelum datang, Bara tunggu! 💪' + left, url: '/?kelas=today' };
    }
    /* phase 2 (099): the coach replied, new homework, the Sunday check-in */
    if (pt.reply) return { kind: 'ptreply', title: coach + ' dah balas check-in awak', body: 'Buka HITFAT+ untuk baca. 💬', url: '/?kelas=today' };
    if (pt.hw_new > 0) return { kind: 'pthw', title: 'Homework baru dari ' + coach, body: pt.hw_new + ' tugasan untuk dibuat. Tanda setiap satu untuk +20 mata.', url: '/?kelas=today' };
    if (!pt.ci_done && new Date(today + 'T12:00:00Z').getUTCDay() === 0)
      return { kind: 'ptci', title: 'Check-in mingguan dengan ' + coach, body: 'Dua minit je: berat, tenaga, tidur dan makanan minggu ni. +50 mata.', url: '/?kelas=today' };
    if (pt.end && daysBetween(today, String(pt.end).slice(0, 10)) === 3)
      return { kind: 'ptend', title: 'Pakej PT awak tamat dalam 3 hari', body: 'Tamat pada ' + fmtDay(String(pt.end).slice(0, 10)) + '. Cakap dengan ' + coach + ' untuk teruskan sesi.', url: '/?kelas=today' };
  }
  const end = c.end ? String(c.end).slice(0, 10) : '';
  if (end) {
    const left = daysBetween(today, end);
    const renew = 'Renew di kaunter HITFAT supaya kelas, mata dan streak awak berterusan.';
    if (c.active && left === 7) return { kind: 'end7', title: 'Membership kelas awak tamat dalam 7 hari', body: 'Tamat pada ' + fmtDay(end) + '. ' + renew, url: '/?kelas=today' };
    if (c.active && left === 3) return { kind: 'end3', title: 'Tinggal 3 hari membership kelas awak', body: 'Tamat pada ' + fmtDay(end) + '. ' + renew, url: '/?kelas=today' };
    if (c.active && left === 1) return { kind: 'end1', title: 'Membership kelas awak tamat esok', body: 'Esok hari terakhir. ' + renew, url: '/?kelas=today' };
    if (!c.active && left === -1) return { kind: 'ended', title: 'Membership kelas awak dah tamat 😢', body: 'Bara rindu awak kat kelas. Renew di kaunter dan kiosk akan benarkan awak masuk semula.', url: '/?kelas=today' };
  }
  if (c.active && c.last) {
    const gap = daysBetween(String(c.last).slice(0, 10), today);
    if (gap === 7) return { kind: 'class7', title: 'Bara rindu awak kat kelas 🥺', body: 'Dah seminggu sejak kelas terakhir. Group kelas awak tunggu, datang minggu ni ya!', url: '/?kelas=today' };
    if (gap === 14) return { kind: 'class14', title: 'Dua minggu tak datang kelas...', body: 'Bara masih simpan tempat awak. Satu kelas minggu ni dah cukup untuk mula balik.', url: '/?kelas=today' };
  }
  /* the 1st: last month's recap, for a member who came to class last month */
  if (today.slice(8, 10) === '01' && c.last) {
    const lm = new Date(Date.parse(today + 'T00:00:00Z') - 86400000), name = MONTHS[lm.getUTCMonth()];
    if (daysBetween(String(c.last).slice(0, 10), today) <= 31) return { kind: 'recap', title: '📅 Rekap ' + name + ' awak dah siap', body: 'Kelas, PR dan streak awak untuk bulan ' + name + '. Tengok, lepas tu share!', url: '/?kelas=progress' };
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
    const n = await sendTo(admin, subs || [], { kind: 'test', title: 'Hai, Bara ni! 👋', body: 'Peringatan dah on. Bara akan ingatkan awak pukul 8 malam bila ada sesuatu nak cakap.' });
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
