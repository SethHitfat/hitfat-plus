/* ═══════════════════════════════════════════════════════════════
   HITFAT CLUB · club-checkin

   The counter, as an endpoint. Two actions, two audiences:

     token   member → issue the QR their phone is showing
     redeem  staff  → a coach scanned one; mark them in, pay the points

   Only these two need the service role. The timetable and the register are
   read by the coach's own session, against RLS — see the note further down.

   The thing worth being careful about is that a QR shown on a phone is
   public. Someone photographs it over a shoulder, someone screenshots it in
   a group chat. So the QR carries a token that is worth nothing after three
   minutes and nothing at all after one use — never the member's identity.

   Points are awarded here and only here. A client that can write club_points
   can award itself a HITFAT shirt.

   Deploy:  supabase functions deploy club-checkin
   Secrets: none beyond the injected SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
   ═══════════════════════════════════════════════════════════════ */

import { createClient } from 'jsr:@supabase/supabase-js@2';

/* Three minutes is long enough to walk from the door to the counter and
   short enough that a screenshot in a group chat is worthless by the time
   anyone acts on it. The client refreshes at half this. */
const TOKEN_TTL_SECONDS = 180;

/* What a class is worth. One number, one place. */
const POINTS_PER_CLASS = 5;

/* How far either side of a class the door counts as open. Members arrive
   early and coaches tap late; a 30-minute skirt on both ends means neither
   has to think about it. */
const CLASS_GRACE_MINUTES = 30;

/* No O/0 and no I/1. This code gets read aloud across a gym floor with
   music on, and those are the two pairs people get wrong. */
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

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

function shortCode() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return out;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405);

  try {
    /* ── who is calling ───────────────────────────────────────
       The anon key ships inside the HTML and is not an identity. Only a
       real signed-in session gets past this. */
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

    /* Club standing decides everything below. A HITFAT+ user with no row
       here is a general user and has no business at this endpoint. */
    const { data: me, error: meErr } = await admin
      .from('club_members')
      .select('user_id, role, status, member_no')
      .eq('user_id', user.id)
      .maybeSingle();
    if (meErr) return json({ error: 'Could not check your membership.' }, 503);
    if (!me)   return json({ error: 'You are not a Club member.' }, 403);

    const isStaff = ['coach', 'staff', 'admin'].includes(me.role);

    let body: any;
    try { body = await req.json(); }
    catch { return json({ error: 'Bad request body.' }, 400); }

    const action = String(body?.action || '');

    /* ══ member · issue the QR ═════════════════════════════════ */
    if (action === 'token') {
      if (me.status !== 'active') {
        return json({ error: 'Your membership is ' + me.status + '.', code: me.status }, 403);
      }

      /* Retire whatever the phone was showing before. Two live tokens for
         one member is not dangerous, but it does mean a stale screenshot
         still works after they pulled a fresh code — which is the exact
         thing the expiry is for. */
      await admin.from('club_checkin_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('used_at', null);

      const expires = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString();

      /* The short code is unique only among unused tokens, so a collision is
         possible and cheap to survive. Three attempts against a 32^6 space
         with a handful of live codes is far beyond sufficient. */
      let row: any = null;
      for (let i = 0; i < 3 && !row; i++) {
        const r = await admin.from('club_checkin_tokens')
          .insert({ user_id: user.id, short_code: shortCode(), expires_at: expires })
          .select('token, short_code, expires_at')
          .maybeSingle();
        if (!r.error) { row = r.data; break; }
        if (r.error.code !== '23505') {
          console.error('token insert failed', r.error.message);
          return json({ error: 'Could not create your check-in code.' }, 503);
        }
      }
      if (!row) return json({ error: 'Could not create your check-in code.' }, 503);

      return json({
        ok: true,
        token: row.token,
        code: row.short_code,
        expires_at: row.expires_at,
        ttl: TOKEN_TTL_SECONDS,
        member_no: me.member_no || null,
      });
    }

    /* ══ everything below is staff only ════════════════════════
       The register and the timetable are NOT here. Both are readable by a
       coach's own session — the timetable through club_sessions' policy,
       the register through the club_roster function, whose staff guard
       reads auth.uid(). Routing them through the service role would blind
       that guard: auth.uid() is null here, club_is_staff() would return
       false, and the console would show an empty class rather than an
       error. The coach client calls those two directly. */

    /* ══ staff · a coach scanned someone in ════════════════════ */
    if (action === 'redeem') {
      const raw = String(body?.token || body?.code || '').trim();
      if (!raw) return json({ error: 'Nothing scanned.' }, 400);

      /* The QR carries "HFC1:<uuid>". A typed code is six characters. Tell
         them apart by shape rather than by asking the coach which they used. */
      const scanned = raw.replace(/^HFC1:/i, '').trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(scanned);

      const q = admin.from('club_checkin_tokens')
        .select('token, user_id, expires_at, used_at')
        .is('used_at', null);
      const { data: tok, error: tokErr } = isUuid
        ? await q.eq('token', scanned).maybeSingle()
        : await q.eq('short_code', scanned.toUpperCase()).maybeSingle();

      if (tokErr) return json({ error: 'Could not read that code.' }, 503);
      /* Nothing matched, which is either a code already spent or six
         characters mistyped across a noisy gym floor. Saying "already used"
         for both sends the coach looking for the wrong problem. */
      if (!tok) return json({
        error: isUuid
          ? 'That code has already been used — ask them to refresh.'
          : 'No live code matches that. Check the characters, or ask them to refresh.',
        code: 'unknown',
      }, 409);
      if (new Date(tok.expires_at).getTime() < Date.now()) {
        return json({ error: 'That code has expired — ask them to refresh.', code: 'expired' }, 410);
      }

      /* Which class are we standing in? The coach's console names one; if it
         did not, find the one whose door is open right now. */
      let sessionId = String(body?.session_id || '');
      if (!sessionId) {
        const grace = CLASS_GRACE_MINUTES * 60 * 1000;
        const { data: near } = await admin.from('club_sessions')
          .select('id, starts_at, ends_at')
          .eq('status', 'scheduled')
          .gte('ends_at',   new Date(Date.now() - grace).toISOString())
          .lte('starts_at', new Date(Date.now() + grace).toISOString())
          .order('starts_at').limit(1);
        sessionId = near?.[0]?.id || '';
      }
      if (!sessionId) {
        return json({ error: 'No class is running right now. Pick one first.', code: 'no_session' }, 409);
      }

      /* Burn the token before anything else. If the write below fails the
         member simply pulls a fresh code — far better than a token that
         survives a partial failure and can be replayed. The guard on used_at
         makes two coaches scanning the same screen a no-op for the second. */
      const burn = await admin.from('club_checkin_tokens')
        .update({ used_at: new Date().toISOString(), used_by: user.id, session_id: sessionId })
        .eq('token', tok.token).is('used_at', null).select('token').maybeSingle();
      if (!burn.data) return json({ error: 'That code has already been used.', code: 'used' }, 409);

      /* Walk-ins are normal. A member with no booking for this class gets one
         created as attended rather than being turned away at the counter. */
      const { data: booking, error: bErr } = await admin.from('club_bookings')
        .upsert({
          user_id: tok.user_id,
          session_id: sessionId,
          status: 'attended',
          checked_in_at: new Date().toISOString(),
        }, { onConflict: 'user_id,session_id' })
        .select('id, user_id, status')
        .maybeSingle();
      if (bErr || !booking) {
        console.error('attendance write failed', bErr?.message);
        return json({ error: 'Could not record that check-in.' }, 503);
      }

      /* Points are keyed on the booking, and the database refuses a second
         row for the same one. A coach who taps twice pays once. */
      const { error: pErr } = await admin.from('club_points').insert({
        user_id: tok.user_id,
        amount: POINTS_PER_CLASS,
        kind: 'class_attendance',
        reference_id: booking.id,
        description: 'Class attendance',
      });
      const alreadyPaid = !!pErr && pErr.code === '23505';
      if (pErr && !alreadyPaid) console.error('points insert failed', pErr.message);

      /* Name the person back to the coach. A console that says "checked in"
         without saying who is a console nobody trusts. */
      const u = await admin.auth.admin.getUserById(tok.user_id);
      const meta = u.data?.user?.user_metadata || {};
      const { data: mem } = await admin.from('club_members')
        .select('member_no, plan').eq('user_id', tok.user_id).maybeSingle();

      /* Summed in the database. Pulling the ledger back to add it up here
         would silently stop at PostgREST's row cap on a member with a long
         history, and tell them at the counter that they have fewer points
         than they do. */
      const { data: bal } = await admin.from('club_balances')
        .select('balance').eq('user_id', tok.user_id).maybeSingle();
      const balance = bal?.balance ?? 0;

      return json({
        ok: true,
        already: alreadyPaid,
        points: alreadyPaid ? 0 : POINTS_PER_CLASS,
        balance,
        member: {
          user_id: tok.user_id,
          name: meta.name || meta.full_name || (u.data?.user?.email || '').split('@')[0] || 'Member',
          member_no: mem?.member_no || null,
          plan: mem?.plan || null,
        },
        session_id: sessionId,
      });
    }

    return json({ error: 'Unknown action.' }, 400);

  } catch (e) {
    console.error('club-checkin crashed', e);
    return json({ error: 'Check-in failed. Try again.' }, 500);
  }
});
