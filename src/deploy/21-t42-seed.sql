-- ═══════════════════════════════════════════════════════════════
--  T42 · the first edition
--  Run after 20-t42-core.sql.
--
--  Until a row exists in t42_challenges, T42 is invisible — the app shows
--  no card on Home and no entry anywhere, which is correct: an app should
--  not advertise a challenge nobody can join. This file creates the one
--  that can be joined.
--
--  Edit the two dates and the name, then run it. Re-running is safe: it
--  keys on the slug and updates rather than inserting a second November.
--
--  The scoring weights live in config rather than in code, because the
--  brief asks for them to be configurable and because an edition that
--  weighs fat loss differently should be an UPDATE, not a deploy. Nothing
--  in the app reads them — the scoring function does, and that lands with
--  Phase 4. They are recorded now so the numbers are decided in daylight
--  rather than invented later by whoever writes the scorer.
-- ═══════════════════════════════════════════════════════════════

insert into public.t42_challenges
  (slug, name, edition, starts_on, ends_on, reg_opens_on, reg_closes_on,
   status, total_days, config)
values (
  't42-nov-2026',
  'T42 November 2026',
  'November 2026',
  date '2026-11-03',
  date '2026-12-14',          -- 42 days inclusive of the start
  date '2026-10-06',
  date '2026-11-02',
  'registration',
  42,
  jsonb_build_object(
    'step_target', 8000,
    'water_target_ml', 2000,
    -- The baseline is the line every result is measured from, so it stops
    -- being editable soon after the start. Three days for the numbers —
    -- long enough to fix a typo, too short to wait and see — and the first
    -- week for the fitness test, which the app asks for in week one.
    'baseline_lock_day', 3,
    'baseline_fitness_lock_day', 7,
    -- What counts as full marks on each body and fitness component. A
    -- change beyond the target scores the same as hitting it: the challenge
    -- does not reward losing 12% of body weight in six weeks, and should
    -- not be the reason someone tries.
    'targets', jsonb_build_object(
      'weight_loss_pct',     6,      -- of starting weight
      'waist_loss_pct',      8,      -- of starting waist
      'bodyfat_drop_pts',    3,      -- percentage points, InBody
      'fitness_improve_pct', 25,     -- average across the four tests
      'rush_improve_pct',    10      -- first RUSH time against the best since
    ),
    -- Percentages, and each set must total 100. The scorer refuses to run
    -- on a set that does not, rather than quietly normalising it and
    -- ranking people by weights nobody chose.
    'scoring', jsonb_build_object(
      'online_transform', jsonb_build_object(
        'weight_pct', 40, 'waist_pct', 25, 'workout_pct', 20,
        'consistency_pct', 10, 'rush_pct', 5),
      'gym_transform', jsonb_build_object(
        'bodyfat_pct', 40, 'weight_waist_pct', 25, 'attendance_pct', 20,
        'consistency_pct', 10, 'rush_pct', 5),
      'perform', jsonb_build_object(
        'fitness_pct', 50, 'rush_pct', 25, 'workout_pct', 15, 'consistency_pct', 10),
      'consistency', jsonb_build_object(
        'workout_pct', 40, 'checkin_pct', 25, 'steps_pct', 20,
        'rush_pct', 10, 'weekly_pct', 5)
    )
  )
)
on conflict (slug) do update set
  name          = excluded.name,
  edition       = excluded.edition,
  starts_on     = excluded.starts_on,
  ends_on       = excluded.ends_on,
  reg_opens_on  = excluded.reg_opens_on,
  reg_closes_on = excluded.reg_closes_on,
  status        = excluded.status,
  total_days    = excluded.total_days,
  config        = excluded.config,
  updated_at    = now();


-- ── the six weeks ───────────────────────────────────────────────
-- The arc the brief describes. A week with no row still works — the app
-- falls back to the day number — but the weekly review has nothing to
-- call itself, and "WEEK 3" is a worse heading than "Eat Better".
insert into public.t42_weeks
  (challenge_id, week_no, theme, focus, step_target, mini_title, mini_detail, rush_title, rush_target)
select c.id, w.week_no, w.theme, w.focus, w.step_target,
       w.mini_title, w.mini_detail, w.rush_title, w.rush_target
  from public.t42_challenges c
  cross join (values
    (1, 'Build the Habit',  'Start consistently. Small, every day, beats big once a week.', 7000,
        'Step Challenge',        'Hit your step target five days out of seven.',
        'City Circuit',          'Complete 1 race'),
    (2, 'Move More',        'Daily movement. Walk more, sit less — steps count.',          8000,
        'Hydration Challenge',   'Two litres a day, every day this week.',
        'City Circuit',          'Complete 1 race'),
    (3, 'Eat Better',       'A good protein source with every main meal, portions under control.', 8000,
        'RUSH Challenge',        'Beat your week 1 race time.',
        'Night Run',             'Beat your previous time'),
    (4, 'Build Fitness',    'Harder sessions, better recovery. Your body can do more than week one.', 9000,
        'Consistency Challenge', 'Every check-in, every day, no gaps.',
        'Night Run',             'Complete 1 race'),
    (5, 'Push Performance', 'Better quality in every session. Beat last week.',            9000,
        'Workout Streak',        'Four sessions, no missed days between them.',
        'Hill Sprint',           'Complete 1 race'),
    (6, 'Finish Strong',    'Every day to the line. Final assessment, final result.',     10000,
        'Final Push',            'Everything you have, for seven days.',
        'Hill Sprint',           'Post your best time of the challenge')
  ) as w(week_no, theme, focus, step_target, mini_title, mini_detail, rush_title, rush_target)
 where c.slug = 't42-nov-2026'
on conflict (challenge_id, week_no) do update set
  theme       = excluded.theme,
  focus       = excluded.focus,
  step_target = excluded.step_target,
  mini_title  = excluded.mini_title,
  mini_detail = excluded.mini_detail,
  rush_title  = excluded.rush_title,
  rush_target = excluded.rush_target;


-- ── check it landed ─────────────────────────────────────────────
-- Run this on its own afterwards. One challenge, six weeks.
--
--   select c.name, c.status, c.starts_on, count(w.*) as weeks
--     from public.t42_challenges c
--     left join public.t42_weeks w on w.challenge_id = c.id
--    where c.slug = 't42-nov-2026'
--    group by c.id, c.name, c.status, c.starts_on;
