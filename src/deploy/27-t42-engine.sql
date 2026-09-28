-- ═══════════════════════════════════════════════════════════════
--  T42 · THE CHALLENGE ENGINE
--  Run after 26-t42-gym.sql. Safe to run again.
--
--  T42 is a challenge you join, not a program you own. This file makes the
--  database say so, instead of leaving it to the app:
--
--    1. DATES THAT RUN THE EDITION. results_on and access_ends_on join the
--       dates already on t42_challenges, and the hourly job moves each
--       edition along by itself: registration → running on the start
--       date, running → assessment the day after the last day. Only
--       "complete" stays a person's decision, because results are
--       announced after the podium has been checked.
--
--    2. PAYMENT IS THE ENTITLEMENT. A registration is 'pending' until the
--       payment clears (pay-callback / pay-status set it to 'paid'), or an
--       admin confirms a manual payment. Pending can fill in a baseline —
--       that is the sign-up — and nothing else: no plan, no check-ins, no
--       leaderboard place.
--
--    3. ACCESS ENDS. The plan is readable only by a paid participant of
--       THAT edition, from its first day to access_ends_on (by default the
--       last day). After that the content is closed; the result, the score
--       and the certificate are theirs to keep. Buying November does not
--       open Ramadan — every check is scoped to one challenge_id.
--
--  Nothing here rewrites 20–26. Everything is added beside them, with the
--  two replacements (the plan's read policy and t42_compute_all) said out
--  loud below. Re-running 20 or 24 puts the old versions back; run this
--  file again after either.
-- ═══════════════════════════════════════════════════════════════


-- ── run order ───────────────────────────────────────────────────
do $order$
begin
  if to_regclass('public.t42_challenges') is null
     or to_regprocedure('public.t42_compute_scores(uuid)') is null then
    raise exception 'Run 20- to 26-t42-*.sql first — this file builds on them.';
  end if;
end
$order$;


-- ═══════════════════════════════════════════════════════════════
--  1 · THE EDITION'S DATES AND PRICE
-- ═══════════════════════════════════════════════════════════════
alter table public.t42_challenges add column if not exists subtitle       text;
alter table public.t42_challenges add column if not exists cover_url      text;
-- The price of THIS edition, in ringgit. pay-create reads it server-side;
-- the browser never names an amount. Null means payment has not opened —
-- the app says so, and an admin can still confirm a manual payment.
alter table public.t42_challenges add column if not exists price_rm       numeric(8,2);
-- When results are announced. Copy for the app; nothing is gated on it.
alter table public.t42_challenges add column if not exists results_on     date;
-- When the challenge content closes. Null means the last day of the
-- challenge. Later than that only if an edition wants a grace period.
alter table public.t42_challenges add column if not exists access_ends_on date;

do $c$
begin
  if not exists (select 1 from pg_constraint where conname = 't42_access_after_start') then
    alter table public.t42_challenges
      add constraint t42_access_after_start check (access_ends_on is null or access_ends_on >= starts_on);
  end if;
  if not exists (select 1 from pg_constraint where conname = 't42_price_positive') then
    alter table public.t42_challenges
      add constraint t42_price_positive check (price_rm is null or price_rm > 0);
  end if;
end
$c$;

-- The last day the content is open, for one edition.
create or replace function public.t42_access_last_day(p_challenge uuid)
returns date language sql stable set search_path = public as $$
  select coalesce(c.access_ends_on, c.starts_on + c.total_days - 1)
    from public.t42_challenges c where c.id = p_challenge;
$$;


-- ═══════════════════════════════════════════════════════════════
--  2 · WHO HAS PAID
-- ═══════════════════════════════════════════════════════════════
create or replace function public.t42_is_paid_status(p_status text)
returns boolean language sql immutable as $$
  select p_status in ('paid','active','completed');
$$;

-- Am I a paid participant of this edition, inside its content window?
-- Staff can always read — they build and check the plan.
create or replace function public.t42_has_access(p_challenge uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.t42_is_staff() or exists (
    select 1
      from public.t42_registrations r
      join public.t42_challenges c on c.id = r.challenge_id
     where r.challenge_id = p_challenge
       and r.user_id = auth.uid()
       and public.t42_is_paid_status(r.status)
       and c.status not in ('draft','archived')
       and current_date >= c.starts_on
       and current_date <= coalesce(c.access_ends_on, c.starts_on + c.total_days - 1)
  );
$$;
revoke all    on function public.t42_has_access(uuid) from public, anon;
grant execute on function public.t42_has_access(uuid) to authenticated;

-- REPLACES the policy in 20-t42-core.sql, which let anyone signed in read
-- every day of every edition's plan — before paying, before day 1, and for
-- ever after the end.
drop policy if exists t42_plan_read on public.t42_plan_days;
create policy t42_plan_read on public.t42_plan_days
  for select using (public.t42_has_access(challenge_id));


-- ── nothing counts until the place is paid for ──────────────────
-- The baseline is the sign-up, so it is allowed. Everything that scores —
-- check-ins, workouts, RUSH claims, the mid-point and the final — needs a
-- confirmed place. Beside the guards in 24, not instead of them.
create or replace function public.t42_guard_paid()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_status text;
begin
  if auth.uid() is null or public.t42_is_staff() then return new; end if;
  if tg_table_name = 't42_measurements' and new.phase = 'baseline' then return new; end if;
  select status into v_status from public.t42_registrations where id = new.registration_id;
  if v_status is null or not public.t42_is_paid_status(v_status) then
    raise exception 'Your T42 place is not confirmed yet — complete your payment first'
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists t42_guard_paid on public.t42_daily_checkins;
create trigger t42_guard_paid before insert or update on public.t42_daily_checkins
  for each row execute function public.t42_guard_paid();
drop trigger if exists t42_guard_paid on public.t42_workout_completions;
create trigger t42_guard_paid before insert or update on public.t42_workout_completions
  for each row execute function public.t42_guard_paid();
drop trigger if exists t42_guard_paid on public.t42_rush_results;
create trigger t42_guard_paid before insert or update on public.t42_rush_results
  for each row execute function public.t42_guard_paid();
drop trigger if exists t42_guard_paid on public.t42_measurements;
create trigger t42_guard_paid before insert or update on public.t42_measurements
  for each row execute function public.t42_guard_paid();

-- An unpaid registration is never ranked. The scorer still computes the row
-- (so an admin can see where someone would be), but it cannot be eligible,
-- and ranks are only handed to eligible rows.
create or replace function public.t42_scores_paid_only()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.t42_registrations r
              where r.id = new.registration_id and r.status = 'pending') then
    new.eligible := false;
    new.note     := 'Payment not confirmed';
  end if;
  return new;
end $$;

drop trigger if exists t42_scores_paid_only on public.t42_scores;
create trigger t42_scores_paid_only before insert or update on public.t42_scores
  for each row execute function public.t42_scores_paid_only();


-- ═══════════════════════════════════════════════════════════════
--  3 · THE EDITION MOVES ALONG BY ITSELF
-- ═══════════════════════════════════════════════════════════════
create or replace function public.t42_advance()
returns int language plpgsql security definer set search_path = public as $$
declare v_n int := 0; v_m int;
begin
  update public.t42_challenges set status = 'running', updated_at = now()
   where status = 'registration' and current_date >= starts_on;
  get diagnostics v_m = row_count; v_n := v_n + v_m;

  update public.t42_challenges set status = 'assessment', updated_at = now()
   where status = 'running' and current_date > starts_on + total_days - 1;
  get diagnostics v_m = row_count; v_n := v_n + v_m;

  -- A paid place becomes an active one on day 1.
  update public.t42_registrations r set status = 'active'
    from public.t42_challenges c
   where c.id = r.challenge_id and r.status = 'paid'
     and c.status in ('running','assessment');
  get diagnostics v_m = row_count; v_n := v_n + v_m;
  return v_n;
end $$;

-- REPLACES the one in 24-t42-scoring.sql: the same loop, with the dates
-- applied first, so the hourly job that already exists does both.
create or replace function public.t42_compute_all()
returns int language plpgsql security definer set search_path = public as $$
declare v_ch record; v_sum int := 0;
begin
  perform public.t42_advance();
  for v_ch in select id from public.t42_challenges where status in ('running','assessment') loop
    v_sum := v_sum + public.t42_compute_scores(v_ch.id);
  end loop;
  return v_sum;
end $$;

revoke all on function public.t42_advance()     from public, anon, authenticated;
revoke all on function public.t42_compute_all() from public, anon, authenticated;


-- ═══════════════════════════════════════════════════════════════
--  4 · T42 NOVEMBER 2026
--
--  Online only, TRANSFORM and PERFORM, content closing on the last day.
--  The price is NOT set here — it is a business decision, not a migration:
--
--    update public.t42_challenges set price_rm = 99 where slug = 't42-nov-2026';
-- ═══════════════════════════════════════════════════════════════
update public.t42_challenges
   set subtitle       = coalesce(subtitle, '42 days. One transformation.'),
       results_on     = coalesce(results_on, ends_on + 4),
       access_ends_on = coalesce(access_ends_on, ends_on),
       config = config || jsonb_build_object(
         'tracks',      jsonb_build_array('transform','perform'),
         'gym_enabled', false),
       updated_at = now()
 where slug = 't42-nov-2026';

-- The six-week arc, in the words a beginner reads. The mini challenges and
-- RUSH missions stay as they were.
update public.t42_weeks w
   set theme = v.theme, focus = v.focus
  from (values
    (1, 'Build the Habit',  'Start consistently. Small, every day, beats big once a week.'),
    (2, 'Move More',        'Daily movement. Walk more, sit less — steps count.'),
    (3, 'Eat Better',       'A good protein source with every main meal, portions under control.'),
    (4, 'Build Fitness',    'Harder sessions, better recovery. Your body can do more than week one.'),
    (5, 'Push Performance', 'Better quality in every session. Beat last week.'),
    (6, 'Finish Strong',    'Every day to the line. Final assessment, final result.')
  ) as v(week_no, theme, focus)
 where w.week_no = v.week_no
   and w.challenge_id = (select id from public.t42_challenges where slug = 't42-nov-2026');


-- ── check it landed ─────────────────────────────────────────────
--   select slug, status, starts_on, ends_on, access_ends_on, results_on, price_rm,
--          config->'tracks' as tracks, config->'gym_enabled' as gym
--     from public.t42_challenges;
