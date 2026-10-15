/* ═══════════════════════════════════════════════════════════════
   HITFAT+ · plus-push
   Bell's reminders, by Web Push. See 38-plus-push.sql.

   GET  ?action=key              the VAPID public key the app subscribes
                                 with; made here (with the private key)
                                 the first time, kept in plus_settings
   POST ?action=send&key=<cron>  the evening run (pg_cron, 8 pm MYT): each
                                 member with a subscription, their day
                                 read from plus_data, at most one message
   POST ?action=test             a signed-in member's own test message

   What Bell says follows the HITFAT Score in the app (score.js): a day's
   score is the share of its habits done (workout, meals /3, water /8,
   steps /8,000, and the fast for a member with an IF plan); a "hari padu"
   is 50 or more; a "kosong" day is 0.

   Deploy:  supabase functions deploy plus-push --no-verify-jwt
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
  if (ramadan(d, day)) hs.push(dy.ram ? 1 : 0);
  else if (f.plan && !f.plan.blocked) {
    let best = 0, tgt = 16;
    for (const x of (f.log || [])) if (dayOf(x.end) === day && x.hrs > best) { best = x.hrs; tgt = x.target; }
    if (f.active && day === dayBack(0)) { const h = (Date.now() - f.active.at) / 3600000; if (h > best) { best = h; tgt = f.active.target; } }
    hs.push(Math.min(1, best / (tgt || 16)));
  }
  return Math.round(hs.reduce((a, b) => a + b, 0) / hs.length * 100);
}

/* what, if anything, Bell says to this member this evening */
export function messageFor(d: Data): { kind: string; title: string; body: string } | null {
  const wdays: Record<string, number> = {};
  for (const k in (d.sessions || {})) { const s = d.sessions[k]; if (s && s.date) { const dd = dayOf(s.date); wdays[dd] = (wdays[dd] || 0) + 1; } }
  const today = scoreOf(d, dayBack(0), wdays);
  let gap = -1;                                            /* empty days before today */
  for (let i = 1; i < 60; i++) if (scoreOf(d, dayBack(i), wdays) > 0) { gap = i - 1; break; }
  if (gap < 0 && today === 0) return null;                 /* never active: a new member */
  let streak = 0;                                          /* hari padu up to yesterday; a frozen day keeps the run */
  const frozen = (d.sc && d.sc.frozen) || {};
  for (let i = 1; i < 400; i++) { const day = dayBack(i); if (scoreOf(d, day, wdays) >= 50) streak++; else if (!frozen[day]) break; }

  if (streak >= 2 && today < 50) return {
    kind: 'streak', title: '🔥 Streak ' + streak + ' hari dalam bahaya!',
    body: today ? 'Skor hari ni baru ' + today + '. Capai 50 sebelum tidur untuk selamatkan streak anda.'
                : 'Belum ada apa-apa hari ni. Satu workout pendek dan segelas air pun dah banyak membantu.',
  };
  /* Sunday: the week's report, Monday to today, against the week before */
  if (new Date(Date.now() + MYT).getUTCDay() === 0) {
    const wk = (o: number) => { const v: number[] = []; for (let i = o; i < o + 7; i++) v.push(scoreOf(d, dayBack(i), wdays)); return v; };
    const now = wk(0), last = wk(7), avg = Math.round(now.reduce((a, b) => a + b, 0) / 7), prev = Math.round(last.reduce((a, b) => a + b, 0) / 7);
    if (now.some(x => x > 0)) {
      const padu = now.filter(x => x >= 50).length, diff = avg - prev;
      return { kind: 'weekly', title: '📊 Laporan Bell minggu ini',
        body: 'Purata Skor HITFAT ' + avg + '/100' + (diff ? (diff > 0 ? ', naik ' + diff : ', turun ' + (-diff)) : '') + ' · ' + padu + ' hari padu. Buka app untuk tengok laporan penuh.' };
    }
  }
  if (today >= 50 || today > 0) return null;
  const idle = gap + 1;
  if (idle === 2) return { kind: 'dust', title: 'Bell mula berhabuk 😟', body: 'Dua hari Bell tak nampak anda. Rekod sesuatu hari ni sebelum Bell berkarat esok.' };
  if (idle === 3) return { kind: 'rust', title: 'Alamak, Bell dah berkarat 🥲', body: 'Segelas air pun cukup untuk gilap Bell semula. Jom!' };
  if (idle === 7) return { kind: 'rust7', title: 'Seminggu Bell berkarat...', body: 'Bell masih tunggu anda 🧽 Mula semula dengan satu perkara kecil hari ni.' };
  if (idle === 14) return { kind: 'rust14', title: 'Bell rindu anda 🥺', body: 'Dua minggu dah. Tak perlu sempurna, cuma mula semula.' };
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

async function sendTo(admin: any, subs: any[], msg: { kind: string; title: string; body: string }) {
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ title: msg.title, body: msg.body, tag: 'bell-' + msg.kind, url: '/' }), { TTL: 6 * 3600 });
      sent++;
      await admin.from('plus_push_subs').update({ last_sent: dayBack(0), last_kind: msg.kind }).eq('endpoint', s.endpoint);
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
    const n = await sendTo(admin, subs || [], { kind: 'test', title: 'Hai, ini Bell! 👋', body: 'Peringatan dah hidup. Bell akan tegur anda pukul 8 malam bila perlu.' });
    return json({ ok: true, sent: n });
  }

  if (action === 'send') {
    const { data: ck } = await admin.from('plus_settings').select('value').eq('key', 'push_cron_key').maybeSingle();
    if (!ck || url.searchParams.get('key') !== ck.value) return json({ error: 'unauthorised' }, 401);
    const today = dayBack(0);
    const { data: subs } = await admin.from('plus_push_subs').select('*');
    const byUser: Record<string, any[]> = {};
    for (const s of (subs || [])) { if (s.last_sent === today) continue; (byUser[s.user_id] = byUser[s.user_id] || []).push(s); }
    let users = 0, sent = 0;
    for (const uid of Object.keys(byUser)) {
      const { data: row } = await admin.from('plus_data').select('data').eq('user_id', uid).maybeSingle();
      const msg = row && row.data ? messageFor(row.data) : null;
      if (!msg) continue;
      users++; sent += await sendTo(admin, byUser[uid], msg);
    }
    return json({ ok: true, users, sent });
  }

  return json({ error: 'unknown action' }, 400);
});
