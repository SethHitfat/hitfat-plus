-- ═══════════════════════════════════════════════════════════════
--  T42 · GYM DUO
--  Run after 25-t42-finalise.sql — and after the Club schema
--  (10-club-tables.sql and 11-club-checkin.sql), which this builds on.
--
--  Gym Duo does not get its own QR, its own roster or its own coach
--  console. HITFAT Club already has all three, and a coach with two
--  screens open marking the same person present twice is how attendance
--  stops being believed. So:
--
--    · ATTENDANCE is a Club class the member attended during the
--      challenge. The Club check-in is a coach scanning the member's QR at
--      the counter — the verification is the act of recording it.
--    · GYM ACCESS is a club_members row. A T42 gym participant who is not
--      already a member gets one for the length of the edition, granted by
--      an admin (t42_gym_enrol), because Club check-in refuses anyone
--      without an active membership.
--    · THE INBODY is entered by staff onto the participant's own baseline
--      and final measurements. A member can never write body composition —
--      24-t42-scoring.sql already holds that line.
--
--  What is new here is the duo: pairing by code, a partner card that shows
--  the partner's progress without their private numbers, and a duo
--  leaderboard.
-- ═══════════════════════════════════════════════════════════════


-- ── run order ───────────────────────────────────────────────────
do $order$
begin
  if to_regclass('public.club_bookings') is null or to_regclass('public.club_sessions') is null then
    raise exception 'Run 10-club-tables.sql and 11-club-checkin.sql first — Gym Duo attendance is Club check-ins.';
  end if;
  if to_regprocedure('public.t42_full_name(uuid)') is null then
    raise exception 'Run 20- to 25- first — this file builds on them.';
  end if;
end
$order$;


-- ── attendance, the real one ────────────────────────────────────
-- Replaces the stub in 24-. Distinct DAYS attended, not classes: three
-- classes on one Saturday is a long Saturday, not three days of showing up.
-- Dates are Malaysian, because a 7am class is 11pm the day before in UTC.
create or replace function public.t42_gym_attended(p_user uuid, p_from date, p_to date)
returns int language sql stable security definer set search_path = public as $$
  select count(distinct (s.starts_at at time zone 'Asia/Kuala_Lumpur')::date)::int
    from public.club_bookings b
    join public.club_sessions s on s.id = b.session_id
   where b.user_id = p_user
     and b.status = 'attended'
     and (s.starts_at at time zone 'Asia/Kuala_Lumpur')::date between p_from and p_to;
$$;


-- ═══════════════════════════════════════════════════════════════
--  PAIRING
--
--  One partner creates the duo and reads the code out; the other enters
--  it. Pairs can form and break until the baseline closes (day 3 by
--  default), then they are fixed. Capacity (two) and same gender are
--  enforced by the trigger in 20-, whoever does the writing.
-- ═══════════════════════════════════════════════════════════════

-- Four characters, none of them easy to mishear across a gym floor:
-- no 0/O, no 1/I.
create or replace function public.t42_new_duo_code(p_challenge uuid)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_code text; v_try int := 0;
begin
  loop
    select 'T42-' || string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
                                       1 + floor(random() * 32)::int, 1), '')
      into v_code from generate_series(1, 4);
    exit when not exists (select 1 from public.t42_duos
                           where challenge_id = p_challenge and code = v_code);
    v_try := v_try + 1;
    if v_try > 50 then raise exception 'Could not issue a duo code'; end if;
  end loop;
  return v_code;
end $$;

create or replace function public.t42_duo_window_open(p_challenge uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select c.status in ('registration','running')
     and (current_date - c.starts_on + 1) <= coalesce((c.config ->> 'baseline_lock_day')::int, 3)
    from public.t42_challenges c where c.id = p_challenge;
$$;

-- The caller's own gym registration, or an error that says what is wrong.
create or replace function public.t42_my_gym_reg(p_registration uuid)
returns public.t42_registrations language plpgsql stable security definer set search_path = public as $$
declare r public.t42_registrations%rowtype;
begin
  select * into r from public.t42_registrations
   where id = p_registration and user_id = auth.uid();
  if not found then
    raise exception 'That is not your T42 registration' using errcode = 'insufficient_privilege';
  end if;
  if r.mode <> 'gym_duo' then
    raise exception 'Duos are for Gym Duo' using errcode = 'check_violation';
  end if;
  if r.status in ('withdrawn','disqualified') then
    raise exception 'This registration is %', r.status using errcode = 'check_violation';
  end if;
  return r;
end $$;


create or replace function public.t42_duo_create(p_registration uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.t42_registrations%rowtype; v_code text; v_duo uuid;
begin
  r := public.t42_my_gym_reg(p_registration);
  -- Already in one: hand it back rather than making a second.
  if r.duo_id is not null then
    return (select jsonb_build_object('duo_id', d.id, 'code', d.code)
              from public.t42_duos d where d.id = r.duo_id);
  end if;
  if not public.t42_duo_window_open(r.challenge_id) then
    raise exception 'Pairing closed when the baseline did' using errcode = 'check_violation';
  end if;

  v_code := public.t42_new_duo_code(r.challenge_id);
  insert into public.t42_duos (challenge_id, code, created_by)
  values (r.challenge_id, v_code, auth.uid())
  returning id into v_duo;
  update public.t42_registrations set duo_id = v_duo where id = r.id;
  return jsonb_build_object('duo_id', v_duo, 'code', v_code);
end $$;


create or replace function public.t42_duo_join(p_registration uuid, p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.t42_registrations%rowtype; d public.t42_duos%rowtype; v_other text;
begin
  r := public.t42_my_gym_reg(p_registration);

  select * into d from public.t42_duos
   where challenge_id = r.challenge_id and code = upper(trim(coalesce(p_code, '')));
  if not found then
    raise exception 'No duo with that code in this T42' using errcode = 'no_data_found';
  end if;
  if r.duo_id = d.id then
    return jsonb_build_object('duo_id', d.id, 'code', d.code);
  end if;
  if r.duo_id is not null then
    raise exception 'Leave your current duo first' using errcode = 'check_violation';
  end if;
  if d.locked_at is not null or not public.t42_duo_window_open(r.challenge_id) then
    raise exception 'Pairing closed when the baseline did' using errcode = 'check_violation';
  end if;

  -- A duo is judged on one board, so both partners run the same track.
  select p.track into v_other from public.t42_registrations p where p.duo_id = d.id limit 1;
  if v_other is not null and v_other <> r.track then
    raise exception 'Your partner is on the % track. Duos run the same track.', upper(v_other)
      using errcode = 'check_violation';
  end if;

  -- Two, and the same gender: the trigger from 20- says no if not.
  update public.t42_registrations set duo_id = d.id where id = r.id;
  return jsonb_build_object('duo_id', d.id, 'code', d.code);
end $$;


create or replace function public.t42_duo_leave(p_registration uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r public.t42_registrations%rowtype; v_old uuid;
begin
  r := public.t42_my_gym_reg(p_registration);
  if r.duo_id is null then return; end if;
  if not public.t42_duo_window_open(r.challenge_id) then
    raise exception 'Duos are fixed now — the baseline has closed' using errcode = 'check_violation';
  end if;
  v_old := r.duo_id;
  update public.t42_registrations set duo_id = null where id = r.id;
  -- A duo nobody is in is not a duo.
  delete from public.t42_duos d
   where d.id = v_old
     and not exists (select 1 from public.t42_registrations x where x.duo_id = d.id);
end $$;


-- ═══════════════════════════════════════════════════════════════
--  THE PARTNER CARD
--
--  What a duo partner may see of the other, and it is less than it looks:
--  a first name, whether today's workout and check-in are done, today's
--  steps, gym attendance, and progress as PERCENTAGES. Never a weight in
--  kilograms, never a body fat reading, never a photo. The policies in 20-
--  keep the partner's rows closed; this is the one door, and it only opens
--  onto the caller's own duo.
-- ═══════════════════════════════════════════════════════════════
create or replace function public.t42_duo_card(p_registration uuid)
returns table (registration_id uuid, is_me boolean, display_name text, track text,
               baseline_ok boolean, inbody_ok boolean, ready boolean,
               checked_in_today boolean, workout_today boolean, steps_today int,
               gym_today boolean, attended int,
               weight_change_pct numeric, waist_change_pct numeric,
               workout_pct numeric, attendance_pct numeric, total numeric)
language sql stable security definer set search_path = public as $$
  select m.id,
         m.user_id = auth.uid(),
         public.t42_display_name(m.user_id),
         m.track,
         (b.weight_kg is not null and b.waist_cm is not null),
         (b.body_fat_pct is not null),
         (b.weight_kg is not null and b.waist_cm is not null
            and (m.track <> 'transform' or b.body_fat_pct is not null)),
         (ck.id is not null),
         (wc.id is not null),
         ck.steps,
         coalesce(public.t42_gym_attended(m.user_id, current_date, current_date), 0) > 0,
         coalesce(public.t42_gym_attended(m.user_id, ch.starts_on,
                    least(current_date, ch.starts_on + ch.total_days - 1)), 0),
         case when b.weight_kg > 0 and lt.weight_kg is not null
              then round((lt.weight_kg - b.weight_kg) / b.weight_kg * 100, 1) end,
         case when b.waist_cm > 0 and lt.waist_cm is not null
              then round((lt.waist_cm - b.waist_cm) / b.waist_cm * 100, 1) end,
         s.workout_pct, s.attendance_pct, s.total
    from public.t42_registrations me
    join public.t42_challenges ch on ch.id = me.challenge_id
    join public.t42_registrations m on m.duo_id = me.duo_id
    left join public.t42_measurements b on b.registration_id = m.id and b.phase = 'baseline'
    left join lateral (
      select x.weight_kg, x.waist_cm from public.t42_measurements x
       where x.registration_id = m.id and x.phase in ('mid','final')
         and x.verify_status not in ('flagged','resubmit')
       order by case x.phase when 'final' then 1 else 2 end limit 1
    ) lt on true
    left join public.t42_daily_checkins ck
           on ck.registration_id = m.id and ck.day_no = current_date - ch.starts_on + 1
    left join public.t42_workout_completions wc
           on wc.registration_id = m.id and wc.day_no = current_date - ch.starts_on + 1
    left join public.t42_scores s on s.registration_id = m.id
   where me.id = p_registration
     and me.user_id = auth.uid()
     and me.duo_id is not null
   order by (m.user_id = auth.uid()) desc, m.joined_at;
$$;


-- ── the duo leaderboard ─────────────────────────────────────────
-- Teams are named by their partners' first names. Chosen team names would
-- need moderating on a public board; two first names do not.
create or replace function public.t42_duo_leaderboard(p_challenge uuid, p_category text, p_limit int default 10)
returns table (place int, team text, score numeric, is_mine boolean)
language sql stable security definer set search_path = public as $$
  select d.rank_category,
         coalesce(nullif(trim(du.team_name), ''),
                  (select string_agg(public.t42_display_name(r.user_id), ' & ' order by r.joined_at)
                     from public.t42_registrations r where r.duo_id = du.id)),
         d.team_total,
         exists (select 1 from public.t42_registrations r
                  where r.duo_id = du.id and r.user_id = auth.uid())
    from public.t42_duo_scores d
    join public.t42_duos du on du.id = d.duo_id
   where d.challenge_id = p_challenge
     and d.eligible
     and d.category = p_category
     and auth.uid() is not null
   order by 1 asc nulls last, 3 desc
   limit least(greatest(coalesce(p_limit, 10), 1), 50);
$$;


-- ═══════════════════════════════════════════════════════════════
--  STAFF
-- ═══════════════════════════════════════════════════════════════

-- Staff may create a measurement — the InBody for a participant who has not
-- filled in their own baseline yet. Updating was already theirs (20-).
drop policy if exists t42_meas_staff_insert on public.t42_measurements;
create policy t42_meas_staff_insert on public.t42_measurements
  for insert with check (public.t42_is_staff());


-- The gym register for one edition: who is paired with whom, what is
-- missing, who has been in. Staff only; returns nothing to anyone else.
create or replace function public.t42_gym_roster(p_challenge uuid)
returns table (registration_id uuid, full_name text, email text, gender text, track text,
               status text, duo_code text, partner_name text,
               baseline_ok boolean, baseline_inbody boolean, final_inbody boolean,
               attended int, attended_today boolean,
               club_member boolean, club_status text)
language sql stable security definer set search_path = public as $$
  select r.id, public.t42_full_name(r.user_id), u.email, r.gender, r.track, r.status,
         du.code,
         (select public.t42_full_name(p.user_id) from public.t42_registrations p
           where p.duo_id = r.duo_id and p.id <> r.id limit 1),
         (b.weight_kg is not null and b.waist_cm is not null),
         (b.body_fat_pct is not null),
         (fn.body_fat_pct is not null),
         coalesce(public.t42_gym_attended(r.user_id, ch.starts_on,
                    least(current_date, ch.starts_on + ch.total_days - 1)), 0),
         coalesce(public.t42_gym_attended(r.user_id, current_date, current_date), 0) > 0,
         (cm.user_id is not null),
         cm.status
    from public.t42_registrations r
    join public.t42_challenges ch on ch.id = r.challenge_id
    join auth.users u on u.id = r.user_id
    left join public.t42_duos du on du.id = r.duo_id
    left join public.t42_measurements b  on b.registration_id  = r.id and b.phase  = 'baseline'
    left join public.t42_measurements fn on fn.registration_id = r.id and fn.phase = 'final'
    left join public.club_members cm on cm.user_id = r.user_id
   where r.challenge_id = p_challenge
     and r.mode = 'gym_duo'
     and public.t42_is_staff()
   order by du.code nulls last, r.joined_at;
$$;


-- Gym access for the length of the edition. Admin only: this is a
-- membership, and memberships are what the gym charges for. Existing
-- members keep what they have — a coach's role is never touched, and an
-- expiry is only ever pushed later, never earlier.
-- The grant itself, with no permission check: called by the admin RPC below
-- and by the payment trigger. Never granted to a browser.
create or replace function public.t42_gym_grant(p_registration uuid, p_by uuid)
returns text language plpgsql security definer set search_path = public as $$
declare r public.t42_registrations%rowtype; ch public.t42_challenges%rowtype; v_end date;
begin
  select * into r from public.t42_registrations where id = p_registration;
  if not found or r.mode <> 'gym_duo' then
    raise exception 'Not a Gym Duo registration' using errcode = 'check_violation';
  end if;
  select * into ch from public.t42_challenges where id = r.challenge_id;
  v_end := ch.starts_on + ch.total_days - 1;

  insert into public.club_members (user_id, role, plan, status, started_on, expires_on, goal)
  values (r.user_id, 'gym_member', 'T42 Gym', 'active', least(current_date, ch.starts_on), v_end, 'T42')
  on conflict (user_id) do update
     set status     = 'active',
         expires_on = greatest(coalesce(public.club_members.expires_on, excluded.expires_on), excluded.expires_on),
         updated_at = now()
   where public.club_members.role in ('gym_member','hyrox_member');

  insert into public.t42_admin_notes (challenge_id, registration_id, action, detail, acted_by)
  values (ch.id, r.id, 'gym_access', 'Club access until ' || v_end, p_by);
  return 'Gym access until ' || v_end;
end $$;

create or replace function public.t42_gym_enrol(p_registration uuid)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.t42_is_admin() then
    raise exception 'Only an admin can grant gym access' using errcode = 'insufficient_privilege';
  end if;
  return public.t42_gym_grant(p_registration, auth.uid());
end $$;

-- Gym Duo is sold in the app, so a paid place comes with the gym. Without
-- this a member who has paid is turned away at the counter — Club check-in
-- refuses anyone without a club_members row — until staff remember to
-- press a button. Fires once, on the move into paid, and never undoes a
-- grant: a refund is an admin decision, not a trigger's.
create or replace function public.t42_gym_on_paid()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.mode = 'gym_duo'
     and new.status in ('paid','active')
     and coalesce(old.status,'') not in ('paid','active','completed') then
    -- The payment is the thing that must not fail. A grant that cannot be
    -- made is logged for staff (t42_gym_enrol from the admin page) instead.
    begin
      perform public.t42_gym_grant(new.id, null);
    exception when others then
      raise warning 't42 gym access not granted for %: %', new.id, sqlerrm;
      begin
        insert into public.t42_admin_notes (challenge_id, registration_id, action, detail)
        values (new.challenge_id, new.id, 'gym_access_failed', left(sqlerrm, 300));
      exception when others then null;
      end;
    end;
  end if;
  return new;
end $$;

drop trigger if exists t42_gym_on_paid on public.t42_registrations;
create trigger t42_gym_on_paid
  after update of status on public.t42_registrations
  for each row execute function public.t42_gym_on_paid();


-- ── who may call what ───────────────────────────────────────────
revoke all on function public.t42_gym_attended(uuid, date, date) from public, anon, authenticated;
revoke all on function public.t42_new_duo_code(uuid)             from public, anon, authenticated;
revoke all on function public.t42_duo_window_open(uuid)          from public, anon, authenticated;
revoke all on function public.t42_my_gym_reg(uuid)               from public, anon, authenticated;

revoke all on function public.t42_duo_create(uuid)               from public, anon;
revoke all on function public.t42_duo_join(uuid, text)           from public, anon;
revoke all on function public.t42_duo_leave(uuid)                from public, anon;
revoke all on function public.t42_duo_card(uuid)                 from public, anon;
revoke all on function public.t42_duo_leaderboard(uuid, text, int) from public, anon;
revoke all on function public.t42_gym_roster(uuid)               from public, anon;
revoke all on function public.t42_gym_enrol(uuid)                from public, anon;
revoke all on function public.t42_gym_grant(uuid, uuid)          from public, anon, authenticated;
revoke all on function public.t42_gym_on_paid()                  from public, anon, authenticated;
grant execute on function public.t42_duo_create(uuid)                 to authenticated;
grant execute on function public.t42_duo_join(uuid, text)             to authenticated;
grant execute on function public.t42_duo_leave(uuid)                  to authenticated;
grant execute on function public.t42_duo_card(uuid)                   to authenticated;
grant execute on function public.t42_duo_leaderboard(uuid, text, int) to authenticated;
grant execute on function public.t42_gym_roster(uuid)                 to authenticated;
grant execute on function public.t42_gym_enrol(uuid)                  to authenticated;
