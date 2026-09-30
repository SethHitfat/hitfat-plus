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
  (slug, name, edition, subtitle, starts_on, ends_on, reg_opens_on, reg_closes_on,
   results_on, access_ends_on, price, mode_prices, tracks, modes,
   status, total_days, config)
values (
  't42-nov-2026',
  'T42 November 2026',
  'November 2026',
  '42 days. One transformation.',
  date '2026-11-03',
  date '2026-12-14',          -- 42 days inclusive of the start
  date '2026-10-06',
  date '2026-11-02',
  -- Results a week after the last day, and the programme closes with them:
  -- long enough to submit a final assessment and have it verified.
  date '2026-12-21',          -- results_on
  date '2026-12-21',          -- access_ends_on — after this, history only
  -- The prices are read by pay-create on the server. NULL = free: every
  -- registration is entitled, which is how T42 ran before payment. The two
  -- modes cost different amounts, so SET BOTH before registration opens —
  -- per person; each Gym Duo partner pays their own place (the numbers
  -- below are an example, not the price):
  --   update public.t42_challenges
  --      set mode_prices = '{"online_solo":149,"gym_duo":299}'
  --    where slug = 't42-nov-2026';
  -- A mode left out of mode_prices falls back to price. Re-running this
  -- file never clears a price already set.
  null,                       -- price
  null,                       -- mode_prices
  -- Both modes, two tracks: Online Solo anywhere, Gym Duo at HITFAT HQ.
  -- START stays in the engine for a later edition.
  array['transform','perform'],
  array['online_solo','gym_duo'],
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
    -- v2: one challenge score for every ranked track —
    --   consistency 40 · progress 25 · weekly missions 20 · fitness 15.
    -- The v1 sets below stay so an edition can switch back with one UPDATE.
    'scoring_model', 'v2',
    -- What "progress" means per track, out of 100.
    'progress_mix', jsonb_build_object(
      'transform', jsonb_build_object('weight_pct', 50, 'waist_pct', 50),
      'perform',   jsonb_build_object('fitness_pct', 60, 'weight_pct', 20, 'waist_pct', 20)),
    'scoring', jsonb_build_object(
      'v2', jsonb_build_object(
        'consistency_pct', 40, 'progress_pct', 25, 'missions_pct', 20, 'fitness_pct', 15),
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
  subtitle      = excluded.subtitle,
  starts_on     = excluded.starts_on,
  ends_on       = excluded.ends_on,
  reg_opens_on  = excluded.reg_opens_on,
  reg_closes_on = excluded.reg_closes_on,
  results_on    = excluded.results_on,
  access_ends_on= excluded.access_ends_on,
  -- A price an admin has set is not wiped by re-running the seed.
  price         = coalesce(excluded.price, t42_challenges.price),
  mode_prices   = coalesce(excluded.mode_prices, t42_challenges.mode_prices),
  tracks        = excluded.tracks,
  modes         = excluded.modes,
  -- Nor is an edition that is already running or finished sent back to
  -- registration.
  status        = case when t42_challenges.status in ('draft','registration')
                       then excluded.status else t42_challenges.status end,
  total_days    = excluded.total_days,
  config        = excluded.config,
  updated_at    = now();


-- ── the six weeks ───────────────────────────────────────────────
-- The arc the brief describes. A week with no row still works — the app
-- falls back to the day number — but the weekly review has nothing to
-- call itself, and "WEEK 3" is a worse heading than "PROGRESS".
insert into public.t42_weeks
  (challenge_id, week_no, theme, focus, step_target, mini_title, mini_detail, rush_title, rush_target,
   mission_rule)
select c.id, w.week_no, w.theme, w.focus, w.step_target,
       w.mini_title, w.mini_detail, w.rush_title, w.rush_target, w.rule::jsonb
  from public.t42_challenges c
  cross join (values
    (1, 'RESET',        'Baseline. Movement. Hydration. Steps. Simple food.',      7000,
        'Step Challenge',        'Hit your step target five days out of seven.',
        'City Circuit',          'Complete 1 race',
        '{"type":"step_days","min":5}'),
    (2, 'BUILD',        'Routine. Strength. Protein. Showing up.',                 8000,
        'Hydration Challenge',   'Two litres a day, every day this week.',
        'City Circuit',          'Complete 1 race',
        '{"type":"water_days","min":7}'),
    (3, 'PROGRESS',     'Conditioning. Strength endurance. First progress review.', 8000,
        'Nutrition Challenge',   'Nutrition on track five days this week.',
        'Night Run',             'Beat your previous time',
        '{"type":"nutrition_days","min":5}'),
    (4, 'PUSH',         'Leaderboard week. Community push.',                        9000,
        'Consistency Challenge', 'Every check-in, every day, no gaps.',
        'Night Run',             'Complete 1 race',
        '{"type":"checkin_days","min":7}'),
    (5, 'BREAKTHROUGH', 'Visible progress. Keep the discipline.',                   9000,
        'Workout Streak',        'Complete four workouts this week.',
        'Hill Sprint',           'Complete 1 race',
        '{"type":"workouts","min":4}'),
    (6, 'FINISH STRONG','Final push. Final assessment. Final result.',             10000,
        'Final Push',            'Every daily action done, five days this week.',
        'Hill Sprint',           'Post your best time of the challenge',
        '{"type":"full_days","min":5}')
  ) as w(week_no, theme, focus, step_target, mini_title, mini_detail, rush_title, rush_target, rule)
 where c.slug = 't42-nov-2026'
on conflict (challenge_id, week_no) do update set
  theme       = excluded.theme,
  focus       = excluded.focus,
  step_target = excluded.step_target,
  mini_title  = excluded.mini_title,
  mini_detail = excluded.mini_detail,
  rush_title  = excluded.rush_title,
  rush_target = excluded.rush_target,
  mission_rule= excluded.mission_rule;


-- ── check it landed ─────────────────────────────────────────────
-- Run this on its own afterwards. One challenge, six weeks.
--
--   select c.name, c.status, c.starts_on, count(w.*) as weeks
--     from public.t42_challenges c
--     left join public.t42_weeks w on w.challenge_id = c.id
--    where c.slug = 't42-nov-2026'
--    group by c.id, c.name, c.status, c.starts_on;
