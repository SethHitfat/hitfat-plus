/* ═══════════════════════════════════════════════════════════════
   HITFAT+ · ai-coach
   The AI coach for HITFAT+ Coach members (36-plus-ai-coach.sql).

     action 'plan'    a 4-week plan from the member's answers, built only
                      from the filmed library the app sends
     action 'review'  reads a week's logs, writes to the member, and
                      rewrites the next week to suit how it went
     action 'ask'     answers a question with the plan and logs in view

   Only a live HITFAT+ Coach membership (or a HITFAT admin, for testing)
   may call it, and each member is held to a fair number of calls: plans
   3 a month, reviews 3 a week, questions 15 a day. The plan is saved in
   plus_coach_plans so it follows the member to a new phone.

   Deploy:  supabase functions deploy ai-coach
   Secrets: ANTHROPIC_API_KEY
   ═══════════════════════════════════════════════════════════════ */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const MODEL = 'claude-sonnet-5-5';
const LIMITS: Record<string, [number, number]> = {      // calls, per hours
  plan: [3, 24 * 30], review: [3, 24 * 7], ask: [15, 24],
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

const COACH = `You are the HITFAT+ AI coach: a warm, direct Malaysian personal trainer.
You write in simple English a Malaysian beginner understands. You never
diagnose injuries; for pain you say to stop that movement and see a doctor
or physiotherapist, and you choose gentler movements instead.`;

const PLAN_RULES = `Build a 4-week training plan for this member.

Use ONLY exercises from the LIBRARY, spelled exactly as listed. Every one has a
coaching video in the app. Respect the member's equipment and limitations:
leave out movements that load an injured area.

Reply with one JSON object and nothing else (no markdown, no code fence):
{
  "title": "short plan name, e.g. 'Home Fat Loss Foundations'",
  "summary": "2 sentences on what the 4 weeks do",
  "coach_note": "your first message to the member: 3-5 sentences, personal, mention their goal and one thing to focus on",
  "weeks": [
    { "focus": "what this week is about, a few words",
      "days": [
        { "name": "session name, e.g. 'Lower Body Strength'",
          "minutes": number,
          "blocks": [
            { "ex": "Exact Library Name", "sets": number, "reps": number, "rest": seconds, "note": "one short cue" }
          ] } ] } ]
}

Rules:
- Exactly 4 weeks, each with exactly DAYS_PER_WEEK days.
- 4 to 7 blocks a day; the session should fit the minutes asked for.
- A block has either "reps" (strength) or "secs" (a timed hold or cardio, 20-60), never both.
- sets 2-5, reps 6-20, rest 20-120 seconds.
- Progress week to week: more reps or sets, harder variations, less rest.
  Week 4 is the hardest. Start a beginner gently.
- Balance each week: lower body, upper body push and pull, core, conditioning.`;

const REVIEW_RULES = `Review the member's week and rewrite next week.

You get their plan for next week and what they logged this week: sessions done,
reps and kg per exercise, effort (RPE 1-10) and their notes.

Reply with one JSON object and nothing else:
{
  "message": "your note to the member, 3-6 sentences: what went well, one thing to fix, what next week changes and why",
  "next_week": { "focus": "...", "days": [ same shape as the plan's days ] }
}

Rules:
- Keep the same number of days. Use ONLY exercises from the LIBRARY, exact names.
- Effort mostly 9-10 or sessions missed: make it easier (fewer sets or reps, more rest).
- Effort mostly 5 or below and everything done: make it harder (more reps or sets,
  a harder variation, less rest).
- A note mentioning pain: replace that movement with a gentler one for that area.
- If they lifted a weight (kg) for all reps, suggest a little more in that exercise's note.`;

function pick(s: string): any {
  const t = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(t); } catch { /* fall through */ }
  const m = t.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}
const clamp = (v: unknown, lo: number, hi: number, d: number) => {
  const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d;
};

/* Only real library moves, only sane numbers; a day needs at least three. */
function cleanDays(days: any[], lib: Set<string>, want: number) {
  const out: any[] = [];
  for (const d of (Array.isArray(days) ? days : [])) {
    const blocks = (Array.isArray(d?.blocks) ? d.blocks : [])
      .filter((b: any) => b && lib.has(String(b.ex)))
      .slice(0, 8)
      .map((b: any) => {
        const timed = b.secs !== undefined && b.secs !== null && !(Number(b.reps) > 0);
        return {
          ex: String(b.ex), sets: clamp(b.sets, 1, 6, 3),
          ...(timed ? { secs: clamp(b.secs, 10, 180, 40) } : { reps: clamp(b.reps, 1, 50, 10) }),
          rest: clamp(b.rest, 0, 180, 45), note: String(b.note || '').slice(0, 140),
        };
      });
    if (blocks.length >= 3) out.push({ name: String(d?.name || 'Session').slice(0, 60), minutes: clamp(d?.minutes, 10, 90, 30), blocks });
  }
  return out.slice(0, want);
}

async function claude(key: string, system: string, user: string, max: number) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: max, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!r.ok) { console.error('anthropic error', r.status, (await r.text()).slice(0, 300)); return null; }
  const out = await r.json();
  return (out?.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('').trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const auth = req.headers.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) return json({ error: 'Sign in first.' }, 401);
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } });
    const { data: ud } = await admin.auth.getUser(token);
    const user = ud?.user;
    if (!user || !user.id || user.role === 'anon') return json({ error: 'Sign in first.' }, 401);

    /* ── a Coach member, or an admin trying it out ── */
    const nowIso = new Date().toISOString();
    const { data: coachRows } = await admin.from('plus_entitlements').select('id')
      .eq('user_id', user.id).like('sku', 'sub_coach%').gt('expires_at', nowIso).limit(1);
    let allowed = !!(coachRows && coachRows.length);
    if (!allowed) {
      const { data: staff } = await admin.from('club_members').select('role')
        .eq('user_id', user.id).eq('role', 'admin').limit(1);
      allowed = !!(staff && staff.length);
    }
    if (!allowed) return json({ error: 'The AI coach is part of HITFAT+ Coach.', code: 'not_coach' }, 403);

    let body: any = {};
    try { body = await req.json(); } catch { return json({ error: 'Bad request.' }, 400); }
    const action = String(body?.action || '');
    if (!LIMITS[action]) return json({ error: 'Unknown action.' }, 400);

    /* ── a fair number of calls ── */
    const [cap, hours] = LIMITS[action];
    const since = new Date(Date.now() - hours * 3600e3).toISOString();
    const { count } = await admin.from('plus_coach_usage').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('kind', action).gte('created_at', since);
    if ((count ?? 0) >= cap) {
      const what = action === 'plan' ? `${cap} new plans a month` : action === 'review' ? `${cap} reviews a week` : `${cap} questions a day`;
      return json({ error: `You have reached ${what}. Try again later.`, code: 'limit' }, 429);
    }

    const key = Deno.env.get('ANTHROPIC_API_KEY');
    if (!key) return json({ error: 'The coach is not configured yet.' }, 500);

    const libList: string[] = (Array.isArray(body?.library) ? body.library : []).map((x: any) => String(x)).slice(0, 400);
    const lib = new Set(libList.map((x) => x.split('|')[0]));
    const intake = body?.intake && typeof body.intake === 'object' ? body.intake : {};
    const dpw = clamp(intake.days, 2, 6, 3);

    if (action === 'plan') {
      if (lib.size < 20) return json({ error: 'The exercise library did not arrive.' }, 400);
      const user_msg = `MEMBER\n${JSON.stringify(intake)}\n\nDAYS_PER_WEEK: ${dpw}\n\nLIBRARY (name|equipment|type|muscle)\n${libList.join('\n')}`;
      const text = await claude(key, COACH + '\n\n' + PLAN_RULES.replace('DAYS_PER_WEEK', String(dpw)), user_msg, 12000);
      const p = text ? pick(text) : null;
      if (!p || !Array.isArray(p.weeks)) return json({ error: 'The coach could not build a plan. Try again.' }, 502);
      const weeks = p.weeks.slice(0, 4).map((w: any) => ({ focus: String(w?.focus || '').slice(0, 80), days: cleanDays(w?.days, lib, dpw) }))
        .filter((w: any) => w.days.length);
      if (weeks.length < 4) return json({ error: 'The coach could not build a full plan. Try again.' }, 502);
      const plan = { title: String(p.title || 'Your Plan').slice(0, 60), summary: String(p.summary || '').slice(0, 400),
        coach_note: String(p.coach_note || '').slice(0, 900), weeks, days: dpw, made: nowIso };
      const { data: row, error } = await admin.from('plus_coach_plans')
        .insert({ user_id: user.id, intake, plan }).select('id').single();
      if (error) console.error('plan save failed', error.message);
      await admin.from('plus_coach_usage').insert({ user_id: user.id, kind: 'plan' });
      return json({ id: row?.id || null, plan });
    }

    if (action === 'review') {
      const w = clamp(body?.week, 0, 3, 0);
      const next = body?.next_week;
      const user_msg = `MEMBER\n${JSON.stringify(intake)}\n\nTHIS WEEK (${w + 1}) LOGS\n${JSON.stringify(body?.logs || []).slice(0, 8000)}\n\n` +
        (next ? `NEXT WEEK AS PLANNED\n${JSON.stringify(next).slice(0, 6000)}\n\n` : 'This was the last week of the plan; there is no next week to rewrite. Return "next_week": null.\n\n') +
        `LIBRARY (name|equipment|type|muscle)\n${libList.join('\n')}`;
      const text = await claude(key, COACH + '\n\n' + REVIEW_RULES, user_msg, 5000);
      const r = text ? pick(text) : null;
      if (!r || !r.message) return json({ error: 'The coach could not review your week. Try again.' }, 502);
      let next_week = null;
      if (next && r.next_week) {
        const days = cleanDays(r.next_week.days, lib, dpw);
        if (days.length) next_week = { focus: String(r.next_week.focus || next.focus || '').slice(0, 80), days };
      }
      if (next_week && body?.plan_id) {
        const { data: cur } = await admin.from('plus_coach_plans').select('plan, version').eq('id', body.plan_id).eq('user_id', user.id).maybeSingle();
        if (cur?.plan?.weeks && cur.plan.weeks[w + 1]) {
          cur.plan.weeks[w + 1] = next_week;
          await admin.from('plus_coach_plans').update({ plan: cur.plan, version: (cur.version || 1) + 1, updated_at: nowIso })
            .eq('id', body.plan_id).eq('user_id', user.id);
        }
      }
      await admin.from('plus_coach_usage').insert({ user_id: user.id, kind: 'review' });
      return json({ message: String(r.message).slice(0, 1500), next_week });
    }

    /* ask */
    const q = String(body?.question || '').trim().slice(0, 500);
    if (q.length < 3) return json({ error: 'Ask a question.' }, 400);
    const ctx = `MEMBER\n${JSON.stringify(intake)}\n\nCURRENT WEEK\n${JSON.stringify(body?.week_plan || null).slice(0, 4000)}\n\n` +
      `RECENT LOGS\n${JSON.stringify(body?.logs || []).slice(0, 4000)}\n\nQUESTION\n${q}`;
    const text = await claude(key, COACH + '\n\nAnswer the member\'s question in under 150 words, plainly, as their coach. ' +
      'If it is about food, be practical for Malaysian meals. No markdown headings.', ctx, 700);
    if (!text) return json({ error: 'The coach could not answer just now. Try again.' }, 502);
    await admin.from('plus_coach_usage').insert({ user_id: user.id, kind: 'ask' });
    return json({ answer: text.slice(0, 1500) });

  } catch (e) {
    console.error('ai-coach crashed', e);
    return json({ error: 'The coach had a problem. Try again.' }, 500);
  }
});
