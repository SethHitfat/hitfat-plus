-- ═══════════════════════════════════════════════════════════════
--  T42 · TRANSFORMATION 42 DAYS · core schema
--  Run once in Supabase project ercvaagznsndvrewlvgt (the HITFAT+ one),
--  after 10-club-tables.sql.
--
--  Fourteen tables, not the twenty-five sketched in the brief. What was
--  folded, and why — because every one of these is a pair of tables that
--  would otherwise have to be kept in step by hand:
--
--    t42_tracks → a column
--        START / TRANSFORM / PERFORM is a choice, not an entity. It has a
--        name and a strapline and both live in the app. The day a track
--        carries its own price or its own prize, give it a table.
--
--    t42_duo_members → t42_registrations.duo_id
--        A duo is exactly two registrations. A join table for a pair that
--        can never be three is a second place to be wrong about who is on
--        a team.
--
--    t42_baselines + t42_final_assessments + t42_progress_photos
--    + t42_online_verifications + t42_inbody  → t42_measurements
--        These are ONE row at five moments in its life. The same weight,
--        waist, photo set and verification state is taken on day 0 and
--        again on day 42; an InBody is those columns filled in rather than
--        left null. Five tables would mean five schemas to change the day
--        a sixth measurement is added, and a scoring query that joins all
--        of them to find out whether someone actually started.
--
--    t42_activity_logs → t42_daily_checkins
--        Steps and water ARE the check-in. The brief's own check-in screen
--        asks for them.
--
--    t42_coach_verifications → columns on the attendance row
--        A verification is a coach's signature on an attendance, not a
--        record that can exist without one.
--
--    t42_rush_missions + t42_weekly_challenges → t42_weeks
--        Both are "what week 3 asks of you". One row per week per edition.
--
--    t42_rewards → challenge config
--        Prizes are copy until someone is paid. Not a table yet.
--
--  GYM ATTENDANCE IS NOT HERE. T42 Gym check-in, coach verification and
--  InBody are exactly what HITFAT Club already models in club_bookings,
--  club_sessions and club_inbody. Building a second QR, a second roster
--  and a second coach console would mean a coach with two screens open
--  marking the same person present twice. The bridge lives in
--  21-t42-gym.sql so that this file can be run whether or not the Club is
--  switched on.
--
--  EDITIONS ARE THE ROOT. Every row below hangs off a challenge_id. T42
--  November 2026 is one row in t42_challenges; T42 Ramadan is another.
--  Nothing here assumes there is only ever one.
-- ═══════════════════════════════════════════════════════════════


-- ── run order ───────────────────────────────────────────────────
-- T42 reads coach, staff and admin roles from club_members rather than
-- inventing a second role table, and a LANGUAGE sql function is checked
-- against its tables the moment it is created. Run out of order, this file
-- used to stop halfway with "relation public.club_members does not exist" —
-- true, and no help. It now stops on line one and says what to run.
do $order$
begin
  if to_regclass('public.club_members') is null then
    raise exception 'Run 10-club-tables.sql and 11-club-checkin.sql first — T42 reads staff roles from club_members.';
  end if;
end
$order$;


-- ── the edition ─────────────────────────────────────────────────
-- One row per running of T42. Everything else is scoped to it, so a
-- second edition is an insert rather than a migration.
create table if not exists public.t42_challenges (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,          -- 't42-nov-2026'
  name            text not null,                 -- 'T42 November 2026'
  edition         text,                          -- 'November 2026'
  starts_on       date not null,
  ends_on         date not null,
  reg_opens_on    date,
  reg_closes_on   date,
  status          text not null default 'draft'
                  check (status in ('draft','registration','running','assessment','complete','archived')),
  -- The whole challenge is 42 days by definition, but an edition that runs
  -- short or long should not need a code change to do it.
  total_days      int not null default 42 check (total_days between 7 and 120),
  -- Scoring weights, step targets, prize copy, terms. Read by the scoring
  -- function; nothing in the app hard-codes a weight.
  config          jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (ends_on > starts_on)
);
create index if not exists t42_challenges_status on public.t42_challenges (status);

-- ── the challenge engine (Sept 2026) ────────────────────────────
-- Every edition is its own product with its own dates. These columns are
-- what let a new edition be an INSERT rather than a deploy.
--
--   price            ringgit, read by pay-create on the SERVER. Null or 0
--                    means the edition is free and every registration is
--                    entitled — which is how T42 behaved before payment was
--                    wired, so running this on a live database changes
--                    nothing until an admin sets a price.
--   results_on       when results are expected out (display only).
--   access_ends_on   the day the active programme closes. Null falls back
--                    to results_on. After it, only the participant's
--                    history remains: result, certificate. An edition with
--                    NEITHER date never closes by date — how every edition
--                    behaved before this column existed — and is closed by
--                    being archived instead.
--   tracks / modes   what this edition offers. November 2026 is online
--                    only, TRANSFORM and PERFORM; the engine keeps START and
--                    Gym Duo for editions that want them.
alter table public.t42_challenges add column if not exists subtitle       text;
alter table public.t42_challenges add column if not exists cover_url      text;
alter table public.t42_challenges add column if not exists price          numeric(10,2);
alter table public.t42_challenges add column if not exists results_on     date;
alter table public.t42_challenges add column if not exists access_ends_on date;
alter table public.t42_challenges add column if not exists tracks text[] not null
  default array['start','transform','perform'];
alter table public.t42_challenges add column if not exists modes  text[] not null
  default array['online_solo','gym_duo'];


-- ── a duo ───────────────────────────────────────────────────────
-- Gym mode only. Created by the first partner; the second joins with the
-- code. Same-gender is enforced when the second registration attaches,
-- not here, because gender lives on the registration.
create table if not exists public.t42_duos (
  id              uuid primary key default gen_random_uuid(),
  challenge_id    uuid not null references public.t42_challenges(id) on delete cascade,
  code            text not null,                 -- 'T42-K8F2', what one partner reads to the other
  team_name       text,
  -- Locked once both partners have completed baseline. A duo that can still
  -- swap a partner on day 30 is a duo that can shop for a better score.
  locked_at       timestamptz,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  unique (challenge_id, code)
);


-- ── one person, in one edition ──────────────────────────────────
-- The participant row. A HITFAT+ user with no row here has simply not
-- joined, and sees the invitation rather than the challenge.
create table if not exists public.t42_registrations (
  id              uuid primary key default gen_random_uuid(),
  challenge_id    uuid not null references public.t42_challenges(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  mode            text not null check (mode in ('online_solo','gym_duo')),
  track           text not null check (track in ('start','transform','perform')),
  -- Competition is split by gender and a duo must be same-gender, so this
  -- is a competition field, not profile decoration. Null until asked.
  gender          text check (gender in ('male','female')),
  duo_id          uuid references public.t42_duos(id) on delete set null,
  -- Payment is Bayarcash through the existing pay-* functions. This column
  -- records the state the challenge cares about; plus_orders holds the money.
  status          text not null default 'pending'
                  check (status in ('pending','paid','active','completed','withdrawn','disqualified')),
  product_sku     text,                          -- 't42_online' | 't42_gym_member' | 't42_gym_nonmember'
  -- What the participant sees on a scale photo, and what a reviewer looks
  -- for in it. Unique per registration, never reused.
  verify_code     text,                          -- 'T42-84921'
  consent_at      timestamptz,                   -- terms accepted
  joined_at       timestamptz not null default now(),
  completed_at    timestamptz,
  -- One person, one registration per edition. The whole competition rests
  -- on this line.
  unique (challenge_id, user_id)
);
create index if not exists t42_reg_challenge on public.t42_registrations (challenge_id, status);
create index if not exists t42_reg_user      on public.t42_registrations (user_id);
create index if not exists t42_reg_duo       on public.t42_registrations (duo_id);
-- A duo holds two people and no more. A unique index cannot say that — it
-- can only stop the same person joining twice — so the count is checked on
-- the way in. Enforced here rather than in the app because the app is not
-- the only thing that can write this row.
create or replace function public.t42_duo_capacity()
returns trigger language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if new.duo_id is null then return new; end if;
  select count(*) into n from public.t42_registrations
   where duo_id = new.duo_id and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);
  if n >= 2 then
    raise exception 'That duo already has two partners' using errcode = 'check_violation';
  end if;
  -- Same-gender duos, because that is how the category is judged. Checked
  -- when the second partner attaches, since the first has nobody to differ
  -- from. A partner who has not said yet is allowed in and caught at lock.
  if exists (
    select 1 from public.t42_registrations r
     where r.duo_id = new.duo_id and r.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
       and r.gender is not null and new.gender is not null
       and r.gender <> new.gender
  ) then
    raise exception 'A T42 duo must be two partners of the same gender' using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists t42_duo_capacity_ins on public.t42_registrations;
create trigger t42_duo_capacity_ins
  before insert or update of duo_id, gender on public.t42_registrations
  for each row execute function public.t42_duo_capacity();


-- ── the plan: what day 12 of TRANSFORM asks you to do ───────────
-- Content, edited by admin, read by the app. A day with no row is a rest
-- day — the absence is the meaning, so there is nothing to seed.
create table if not exists public.t42_plan_days (
  id              uuid primary key default gen_random_uuid(),
  challenge_id    uuid not null references public.t42_challenges(id) on delete cascade,
  track           text not null check (track in ('start','transform','perform')),
  day_no          int not null check (day_no >= 1),
  title           text not null,                 -- 'FULL BODY 01'
  -- The exercise list. HITFAT+ already owns 310 filmed exercises and a
  -- player that runs them; this names them rather than restating them, so
  -- a T42 workout plays through exactly the same screen as everything else.
  -- [{n:'Goblet Squat', sets:3, reps:12}, …]
  exercises       jsonb not null default '[]'::jsonb,
  est_minutes     int,
  level           text,                          -- 'Beginner'
  equipment       text,                          -- 'Dumbbell (optional)'
  focus           text,                          -- what today is for, one line
  created_at      timestamptz not null default now(),
  unique (challenge_id, track, day_no)
);


-- ── the week: theme, mini challenge, RUSH mission ───────────────
create table if not exists public.t42_weeks (
  id              uuid primary key default gen_random_uuid(),
  challenge_id    uuid not null references public.t42_challenges(id) on delete cascade,
  week_no         int not null check (week_no between 1 and 20),
  theme           text not null,                 -- 'RESET' | 'BUILD' | 'PROGRESS'…
  focus           text,                          -- 'Baseline. Movement. Hydration.'
  step_target     int,                           -- overrides the challenge default
  mini_title      text,                          -- 'Step Challenge'
  mini_detail     text,
  rush_title      text,                          -- 'CITY CIRCUIT'
  rush_target     text,                          -- 'Complete 1 race'
  unique (challenge_id, week_no)
);

-- The week's mission, as a rule the scorer checks against the week's own
-- check-ins — never a box the participant ticks. Missions are 20% of the
-- score, and a claim a browser can make is a claim a browser can fake.
--   {"type":"step_days","min":5}       steps target hit on N days
--   {"type":"water_days","min":7}      water target hit on N days
--   {"type":"nutrition_days","min":5}  nutrition on track on N days
--   {"type":"checkin_days","min":7}    checked in on N days
--   {"type":"workouts","min":4}        N workouts logged this week
--   {"type":"full_days","min":5}       every daily action done on N days
--   {"type":"rush"}                    a RUSH race completed this week
--   {"type":"rush_beat"}               this week's best beats the first race
alter table public.t42_weeks add column if not exists mission_rule jsonb;


-- ── a measurement, at whatever moment it was taken ──────────────
-- Baseline, mid-point and final are this row with a different phase. An
-- InBody is this row with the body-composition columns filled in. An
-- online submission is this row with photos and a verification state.
create table if not exists public.t42_measurements (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.t42_registrations(id) on delete cascade,
  phase           text not null check (phase in ('baseline','mid','final')),
  taken_on        date not null default current_date,

  -- what everyone gives
  weight_kg       numeric(5,2),
  height_cm       numeric(5,1),
  waist_cm        numeric(5,1),
  age             int,
  goal            text,

  -- body composition. Null for an online participant with no InBody;
  -- present for a gym participant, and the reason gym scoring can weigh
  -- fat loss rather than scale weight.
  body_fat_pct    numeric(4,1),
  muscle_mass_kg  numeric(5,2),
  visceral_fat    numeric(4,1),
  inbody_score    int,
  source          text not null default 'self'
                  check (source in ('self','inbody','coach')),

  -- fitness test, kept open because the test itself will change between
  -- editions and a column per movement would not survive that.
  -- {pushups:22, plank_sec:75, run_1km_sec:340}
  fitness         jsonb not null default '{}'::jsonb,

  -- Private storage paths, never public URLs. Nothing in the leaderboard
  -- reads these columns.
  photo_front     text,
  photo_side      text,
  photo_back      text,

  -- Verification. An online participant photographs the scale with their
  -- verify_code visible; a gym participant is signed off by the coach who
  -- ran the InBody. Same three columns either way.
  verify_status   text not null default 'none'
                  check (verify_status in ('none','pending','verified','flagged','resubmit')),
  verified_by     uuid references auth.users(id) on delete set null,
  verified_at     timestamptz,
  verify_note     text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- One baseline and one final per participant. Re-taking a measurement
  -- updates the row; it does not add a second one for the scorer to choose
  -- between.
  unique (registration_id, phase)
);
create index if not exists t42_meas_verify on public.t42_measurements (verify_status)
  where verify_status in ('pending','flagged');


-- ── the daily check-in ──────────────────────────────────────────
-- One row per participant per day. Steps and water live here because they
-- are what the check-in asks for; a separate activity log would be a
-- second row describing the same day.
create table if not exists public.t42_daily_checkins (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.t42_registrations(id) on delete cascade,
  day_no          int not null check (day_no >= 1),
  on_date         date not null,
  energy          int check (energy between 1 and 5),
  sleep           text check (sleep in ('poor','ok','good')),
  nutrition       text check (nutrition in ('on_track','partly','off_track')),
  water_ml        int check (water_ml >= 0),
  steps           int check (steps >= 0),
  workout         text check (workout in ('completed','planned','rest')),
  mood            text,
  note            text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- Tapping save twice is one check-in, not two. The whole consistency
  -- score depends on this.
  unique (registration_id, day_no)
);
create index if not exists t42_checkin_date on public.t42_daily_checkins (registration_id, on_date);


-- ── a workout that was actually done ────────────────────────────
-- Separate from the check-in because a workout can be completed without
-- one, carries its own duration, and is what the completion percentage is
-- counted from. HITFAT+ logs its own sessions in plus_data; that copy is
-- the participant's, this one is the scorer's.
create table if not exists public.t42_workout_completions (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.t42_registrations(id) on delete cascade,
  day_no          int not null check (day_no >= 1),
  plan_day_id     uuid references public.t42_plan_days(id) on delete set null,
  -- Null for a session done outside the plan, which still counts toward
  -- consistency but not toward plan completion.
  title           text,
  minutes         int,
  exercises_done  int,
  exercises_total int,
  completed_at    timestamptz not null default now(),
  unique (registration_id, day_no)
);


-- ── RUSH ────────────────────────────────────────────────────────
-- RUSH is a separate product at rush.hitfat.io with its own times. Until
-- it exposes an API this row is written by the participant and reviewed
-- like any other claim — which is why it carries a verify_status rather
-- than being trusted into the score.
create table if not exists public.t42_rush_results (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.t42_registrations(id) on delete cascade,
  week_no         int not null check (week_no between 1 and 20),
  race            text,                          -- 'RUSH Putrajaya 5KM'
  completed       boolean not null default false,
  time_sec        int,
  score           numeric(8,2),
  raced_on        date,
  -- Set by the scorer once a second result exists to compare against.
  improvement_pct numeric(6,2),
  verify_status   text not null default 'none'
                  check (verify_status in ('none','pending','verified','flagged')),
  external_ref    text,                          -- RUSH's own id, the day there is one
  created_at      timestamptz not null default now(),
  unique (registration_id, week_no)
);


-- ── the weekly review ───────────────────────────────────────────
-- Computed, then kept. The participant should be able to reopen week 2 in
-- week 6 and see what it said at the time, which a query recomputed
-- against today's data cannot do.
create table if not exists public.t42_weekly_reviews (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.t42_registrations(id) on delete cascade,
  week_no         int not null check (week_no between 1 and 20),
  workouts_done   int not null default 0,
  workouts_target int not null default 0,
  checkins_done   int not null default 0,
  steps_total     int not null default 0,
  nutrition_days  int not null default 0,
  weight_delta    numeric(5,2),
  waist_delta     numeric(5,1),
  rush_completed  boolean not null default false,
  week_score      numeric(5,2),
  computed_at     timestamptz not null default now(),
  unique (registration_id, week_no)
);
-- Whether the week's mission rule was met. Null when the week has no rule.
alter table public.t42_weekly_reviews add column if not exists mission_done boolean;


-- ── the score ───────────────────────────────────────────────────
-- Written by the scoring function and by nothing else. There is no client
-- path to this table: a browser that can write its own score will.
create table if not exists public.t42_scores (
  registration_id uuid primary key references public.t42_registrations(id) on delete cascade,
  challenge_id    uuid not null references public.t42_challenges(id) on delete cascade,
  -- The components, kept alongside the total so a participant can be told
  -- why they scored what they scored, and an admin can see which part of a
  -- suspicious score is the odd one.
  weight_pct      numeric(6,2),
  waist_pct       numeric(6,2),
  bodyfat_pct     numeric(6,2),
  workout_pct     numeric(6,2),
  consistency_pct numeric(6,2),
  attendance_pct  numeric(6,2),
  rush_pct        numeric(6,2),
  fitness_pct     numeric(6,2),
  total           numeric(6,2) not null default 0,
  -- Denormalised so the leaderboard is one indexed read rather than a
  -- window function over every participant on every open.
  rank_overall    int,
  rank_category   int,
  category        text,                          -- 'transform_male' | 'perform_female'…
  is_final        boolean not null default false,
  computed_at     timestamptz not null default now()
);
create index if not exists t42_scores_board on public.t42_scores (challenge_id, category, total desc);


-- ── the duo's score ─────────────────────────────────────────────
-- The average of two percentage improvements, never a sum of kilograms.
-- Adding raw kg would hand the trophy to whichever team happened to be
-- heavier on day one.
create table if not exists public.t42_duo_scores (
  duo_id          uuid primary key references public.t42_duos(id) on delete cascade,
  challenge_id    uuid not null references public.t42_challenges(id) on delete cascade,
  a_total         numeric(6,2),
  b_total         numeric(6,2),
  team_total      numeric(6,2) not null default 0,
  -- Both partners must have a baseline and a final to be ranked. A duo
  -- where one person vanished is not a duo that placed.
  eligible        boolean not null default false,
  rank_category   int,
  category        text,                          -- 'duo_transform_male'…
  is_final        boolean not null default false,
  computed_at     timestamptz not null default now()
);
create index if not exists t42_duo_board on public.t42_duo_scores (challenge_id, category, team_total desc);


-- ── the certificate ─────────────────────────────────────────────
create table if not exists public.t42_certificates (
  id              uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.t42_registrations(id) on delete cascade,
  kind            text not null
                  check (kind in ('finisher','transformation_champion','performance_champion',
                                  'consistency_champion','duo_champion')),
  -- Frozen at issue. A certificate that re-reads the score table would
  -- quietly change after it had been shared.
  participant_name text not null,
  edition         text,
  final_score     numeric(6,2),
  issued_on       date not null default current_date,
  serial          text unique,                   -- what a sceptic can check
  created_at      timestamptz not null default now(),
  unique (registration_id, kind)
);


-- ── admin notes and the audit trail ─────────────────────────────
-- Scores are computed, but an admin can still disqualify, flag or correct.
-- Every one of those leaves a row here, because a leaderboard that can be
-- edited silently is not a leaderboard.
create table if not exists public.t42_admin_notes (
  id              uuid primary key default gen_random_uuid(),
  challenge_id    uuid not null references public.t42_challenges(id) on delete cascade,
  registration_id uuid references public.t42_registrations(id) on delete cascade,
  duo_id          uuid references public.t42_duos(id) on delete cascade,
  action          text not null,                 -- 'flag' | 'verify' | 'disqualify' | 'note'
  detail          text,
  before_value    jsonb,
  after_value     jsonb,
  acted_by        uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists t42_notes_reg on public.t42_admin_notes (registration_id, created_at desc);


-- ═══════════════════════════════════════════════════════════════
--  WHO IS STAFF
--
--  T42 does not invent a second role system. Coach, staff and admin are
--  already club_members.role, which is what coach.html checks and what the
--  Club's own policies use. One row to remove, one person's access gone.
-- ═══════════════════════════════════════════════════════════════
create or replace function public.t42_is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.club_members
    where user_id = auth.uid() and role in ('coach','staff','admin')
  );
$$;

create or replace function public.t42_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.club_members
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- My own registration ids, as a set. Used by every policy below so the
-- ownership rule is written once.
create or replace function public.t42_my_registrations()
returns setof uuid language sql stable security definer set search_path = public as $$
  select id from public.t42_registrations where user_id = auth.uid();
$$;

-- My partner's registration id, if I am in a locked duo. A duo partner may
-- see progress and status. They may NOT see photos or raw body data — that
-- is what the column list in the app is for, and what the note on
-- t42_measurements below spells out.
create or replace function public.t42_my_partner_registration()
returns uuid language sql stable security definer set search_path = public as $$
  select p.id
    from public.t42_registrations me
    join public.t42_registrations p
      on p.duo_id = me.duo_id and p.id <> me.id
   where me.user_id = auth.uid() and me.duo_id is not null
   limit 1;
$$;


-- ═══════════════════════════════════════════════════════════════
--  THE CHALLENGE ENGINE · dates, entitlement, access
--
--  T42 is a challenge, not a library. A participant is entitled to ONE
--  edition — the one they paid for — and only until that edition's
--  access_ends_on. After it, the programme is closed to them and only
--  their history remains (scores, certificates, their own measurements).
--  Nothing here depends on an admin remembering to change a status: every
--  window is worked out from the edition's dates.
-- ═══════════════════════════════════════════════════════════════

-- Today in Malaysia. The database clock is UTC, so current_date turned
-- over at 8am local: a check-in at 7am was refused as "not today", and
-- day 1 did not begin until breakfast. Every T42 window asks this instead.
create or replace function public.t42_today()
returns date language sql stable as $$
  select (now() at time zone 'Asia/Kuala_Lumpur')::date;
$$;

-- The last day the active programme is open. Null: no date closes it.
create or replace function public.t42_access_ends(p_challenge uuid)
returns date language sql stable set search_path = public as $$
  select coalesce(c.access_ends_on, c.results_on)
    from public.t42_challenges c where c.id = p_challenge;
$$;

create or replace function public.t42_access_open(p_challenge uuid)
returns boolean language sql stable set search_path = public as $$
  select coalesce(
    (select c.status not in ('draft','archived')
            and (coalesce(c.access_ends_on, c.results_on) is null
                 or public.t42_today() <= coalesce(c.access_ends_on, c.results_on))
       from public.t42_challenges c where c.id = p_challenge), false);
$$;

-- Is this registration paid for? A free edition (no price) entitles every
-- registration, which is what T42 did before payment was wired. Withdrawn
-- and disqualified never are.
create or replace function public.t42_reg_entitled(p_reg uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select r.status not in ('withdrawn','disqualified')
            and (r.status in ('paid','active','completed')
                 or coalesce(c.price, 0) = 0)
       from public.t42_registrations r
       join public.t42_challenges c on c.id = r.challenge_id
      where r.id = p_reg), false);
$$;

-- Which day is it? (explained in full at the bottom of this file)
create or replace function public.t42_day_no(p_challenge uuid)
returns int language sql stable set search_path = public as $$
  select case
           when public.t42_today() < c.starts_on then 0
           else least(c.total_days, (public.t42_today() - c.starts_on) + 1)
         end
    from public.t42_challenges c where c.id = p_challenge;
$$;

-- May I read this day of the plan? Only a paid participant on that track,
-- only up to today (no reading ahead, no day 1 before the start), and only
-- while the edition's access is open. Staff always.
create or replace function public.t42_can_read_plan(p_challenge uuid, p_track text, p_day int)
returns boolean language sql stable security definer set search_path = public as $$
  select public.t42_is_staff() or (
    public.t42_access_open(p_challenge)
    and p_day <= coalesce(public.t42_day_no(p_challenge), 0)
    and exists (
      select 1 from public.t42_registrations r
       where r.challenge_id = p_challenge and r.user_id = auth.uid()
         and r.track = p_track and public.t42_reg_entitled(r.id)));
$$;

-- Where an edition is in its life, from its dates. The stored status is
-- what an admin sets (draft, and complete via t42_finalise); this is what
-- every screen and job reads. Values:
--   draft · registration · upcoming · active · completed · closed
create or replace function public.t42_phase(p_challenge uuid)
returns text language sql stable set search_path = public as $$
  select case
    when c.status = 'draft'                                         then 'draft'
    when c.status = 'archived'                                      then 'closed'
    when public.t42_today() > coalesce(c.access_ends_on, c.results_on, 'infinity'::date) then 'closed'
    when c.status = 'complete' or public.t42_today() > c.ends_on    then 'completed'
    when public.t42_today() >= c.starts_on                          then 'active'
    when (c.reg_opens_on is null or public.t42_today() >= c.reg_opens_on)
     and (c.reg_closes_on is null or public.t42_today() <= c.reg_closes_on) then 'registration'
    else 'upcoming'
  end
  from public.t42_challenges c where c.id = p_challenge;
$$;


-- ═══════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
--
--  Default deny on every table. A participant reaches their own rows; a
--  coach reaches the rows they need to coach; scores and leaderboards are
--  written by the server only.
--
--  Each policy is dropped before it is created, so this file can be run
--  again — after a mistake halfway, or to pick up a change — without
--  stopping at the first policy that already exists.
-- ═══════════════════════════════════════════════════════════════
alter table public.t42_challenges         enable row level security;
alter table public.t42_duos               enable row level security;
alter table public.t42_registrations      enable row level security;
alter table public.t42_plan_days          enable row level security;
alter table public.t42_weeks              enable row level security;
alter table public.t42_measurements       enable row level security;
alter table public.t42_daily_checkins     enable row level security;
alter table public.t42_workout_completions enable row level security;
alter table public.t42_rush_results       enable row level security;
alter table public.t42_weekly_reviews     enable row level security;
alter table public.t42_scores             enable row level security;
alter table public.t42_duo_scores         enable row level security;
alter table public.t42_certificates       enable row level security;
alter table public.t42_admin_notes        enable row level security;

-- The edition and its weeks are the challenge's public face: anyone signed
-- in may read them, only an admin writes them. The PLAN is not — it is the
-- paid programme, readable only by an entitled participant, a day at a
-- time, while the edition is open (t42_can_read_plan above).
drop policy if exists t42_challenges_read on public.t42_challenges;
create policy t42_challenges_read on public.t42_challenges
  for select using (auth.uid() is not null and status <> 'draft');
drop policy if exists t42_challenges_admin on public.t42_challenges;
create policy t42_challenges_admin on public.t42_challenges
  for all using (public.t42_is_admin()) with check (public.t42_is_admin());

drop policy if exists t42_plan_read on public.t42_plan_days;
create policy t42_plan_read on public.t42_plan_days
  for select using (public.t42_can_read_plan(challenge_id, track, day_no));
drop policy if exists t42_plan_admin on public.t42_plan_days;
create policy t42_plan_admin on public.t42_plan_days
  for all using (public.t42_is_admin()) with check (public.t42_is_admin());

drop policy if exists t42_weeks_read on public.t42_weeks;
create policy t42_weeks_read on public.t42_weeks
  for select using (auth.uid() is not null);
drop policy if exists t42_weeks_admin on public.t42_weeks;
create policy t42_weeks_admin on public.t42_weeks
  for all using (public.t42_is_admin()) with check (public.t42_is_admin());

-- Registration. A participant creates and reads their own; staff read all.
-- Note what is missing: no update policy for the participant. Mode, track
-- and status are set through the join flow and by admin, not by a PATCH
-- from a browser that has decided it is now in the easier category.
drop policy if exists t42_reg_read_own on public.t42_registrations;
create policy t42_reg_read_own on public.t42_registrations
  for select using (user_id = auth.uid() or public.t42_is_staff());
drop policy if exists t42_reg_insert_own on public.t42_registrations;
create policy t42_reg_insert_own on public.t42_registrations
  for insert with check (user_id = auth.uid() and status = 'pending');
drop policy if exists t42_reg_admin on public.t42_registrations;
create policy t42_reg_admin on public.t42_registrations
  for update using (public.t42_is_admin()) with check (public.t42_is_admin());

-- A duo is readable by its members and by staff; created by anyone joining.
drop policy if exists t42_duo_read on public.t42_duos;
create policy t42_duo_read on public.t42_duos
  for select using (
    public.t42_is_staff()
    or exists (select 1 from public.t42_registrations r
                where r.duo_id = t42_duos.id and r.user_id = auth.uid())
  );
drop policy if exists t42_duo_insert on public.t42_duos;
create policy t42_duo_insert on public.t42_duos
  for insert with check (created_by = auth.uid());
drop policy if exists t42_duo_admin on public.t42_duos;
create policy t42_duo_admin on public.t42_duos
  for update using (public.t42_is_admin()) with check (public.t42_is_admin());

-- Measurements: mine, and a coach's. NOT my partner's.
--
-- This is the privacy line the brief draws and it is drawn here rather than
-- in the app: a duo partner sees a percentage on the duo card, computed by
-- the server, and never the weight, the body fat or the photographs behind
-- it. Training with someone does not entitle you to their medical numbers.
drop policy if exists t42_meas_read_own on public.t42_measurements;
create policy t42_meas_read_own on public.t42_measurements
  for select using (
    registration_id in (select public.t42_my_registrations())
    or public.t42_is_staff()
  );
drop policy if exists t42_meas_write_own on public.t42_measurements;
create policy t42_meas_write_own on public.t42_measurements
  for insert with check (registration_id in (select public.t42_my_registrations()));
-- A participant may correct their own measurement only while nobody has
-- signed it off. Once verified, it is evidence.
drop policy if exists t42_meas_update_own on public.t42_measurements;
create policy t42_meas_update_own on public.t42_measurements
  for update using (
    registration_id in (select public.t42_my_registrations())
    and verify_status in ('none','pending','resubmit')
  ) with check (
    registration_id in (select public.t42_my_registrations())
  );
drop policy if exists t42_meas_staff on public.t42_measurements;
create policy t42_meas_staff on public.t42_measurements
  for update using (public.t42_is_staff()) with check (public.t42_is_staff());

-- Daily check-ins, workouts, RUSH: mine to write, staff to read.
drop policy if exists t42_checkin_own on public.t42_daily_checkins;
create policy t42_checkin_own on public.t42_daily_checkins
  for all using (registration_id in (select public.t42_my_registrations()))
  with check (registration_id in (select public.t42_my_registrations()));
drop policy if exists t42_checkin_staff on public.t42_daily_checkins;
create policy t42_checkin_staff on public.t42_daily_checkins
  for select using (public.t42_is_staff());

drop policy if exists t42_workout_own on public.t42_workout_completions;
create policy t42_workout_own on public.t42_workout_completions
  for all using (registration_id in (select public.t42_my_registrations()))
  with check (registration_id in (select public.t42_my_registrations()));
drop policy if exists t42_workout_staff on public.t42_workout_completions;
create policy t42_workout_staff on public.t42_workout_completions
  for select using (public.t42_is_staff());

drop policy if exists t42_rush_own on public.t42_rush_results;
create policy t42_rush_own on public.t42_rush_results
  for all using (registration_id in (select public.t42_my_registrations()))
  with check (registration_id in (select public.t42_my_registrations()));
drop policy if exists t42_rush_staff on public.t42_rush_results;
create policy t42_rush_staff on public.t42_rush_results
  for select using (public.t42_is_staff());

-- Reviews and scores are read-only to everyone. They are written by the
-- scoring function under the service role, which RLS does not apply to.
drop policy if exists t42_review_read on public.t42_weekly_reviews;
create policy t42_review_read on public.t42_weekly_reviews
  for select using (
    registration_id in (select public.t42_my_registrations())
    or public.t42_is_staff()
  );

-- My own score in full; my partner's total; everyone else's nothing. The
-- public leaderboard is a separate view — see 22-t42-leaderboard.sql — and
-- exposes rank, name and total and not one column more.
drop policy if exists t42_score_read on public.t42_scores;
create policy t42_score_read on public.t42_scores
  for select using (
    registration_id in (select public.t42_my_registrations())
    or registration_id = public.t42_my_partner_registration()
    or public.t42_is_staff()
  );

drop policy if exists t42_duo_score_read on public.t42_duo_scores;
create policy t42_duo_score_read on public.t42_duo_scores
  for select using (
    public.t42_is_staff()
    or exists (select 1 from public.t42_registrations r
                where r.duo_id = t42_duo_scores.duo_id and r.user_id = auth.uid())
  );

drop policy if exists t42_cert_read on public.t42_certificates;
create policy t42_cert_read on public.t42_certificates
  for select using (
    registration_id in (select public.t42_my_registrations())
    or public.t42_is_staff()
  );

-- Notes are staff-only in both directions, and nobody may delete one.
drop policy if exists t42_notes_read on public.t42_admin_notes;
create policy t42_notes_read on public.t42_admin_notes
  for select using (public.t42_is_staff());
drop policy if exists t42_notes_insert on public.t42_admin_notes;
create policy t42_notes_insert on public.t42_admin_notes
  for insert with check (public.t42_is_staff() and acted_by = auth.uid());


-- ═══════════════════════════════════════════════════════════════
--  Which day is it?
--
--  Day 18 of 42 is asked for on every screen. Computing it in the app means
--  a participant's phone clock decides which workout they get and whether
--  the final assessment has unlocked.
--
--  0 means the edition has not started — the app shows a countdown, not
--  day 1. Clamping that up to 1 would hand someone day one's workout a
--  week early and start their streak against an empty challenge.
-- ═══════════════════════════════════════════════════════════════
-- Defined with the engine helpers above, because t42_can_read_plan() needs it.


-- ── who may call the engine helpers ─────────────────────────────
-- The policies above run them as the signed-in user, so `authenticated`
-- needs EXECUTE. Nobody signed out does.
revoke all   on function public.t42_reg_entitled(uuid)             from public, anon;
grant execute on function public.t42_reg_entitled(uuid)            to authenticated;
revoke all   on function public.t42_can_read_plan(uuid, text, int)  from public, anon;
grant execute on function public.t42_can_read_plan(uuid, text, int) to authenticated;
