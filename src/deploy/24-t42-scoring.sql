-- ═══════════════════════════════════════════════════════════════
--  T42 · the score
--  Run after 20- to 23-.
--
--  Two halves, and the first matters more than the second.
--
--  1 · GUARDS. Row level security decides WHOSE row a member may write.
--      It says nothing about WHAT they may write into it. Without the
--      triggers below, a member could:
--        · log day 5's check-in on day 30, with a created_at of their choice
--        · raise their baseline weight on day 40 so the loss looks bigger
--        · write verify_status = 'verified' onto their own final
--        · type in their own body fat, which is 40% of the gym score
--      Every one of those is a PATCH from a browser away. A scorer that
--      reads rows like that is ranking whoever edited theirs most boldly.
--
--  2 · THE SCORER. One function, run hourly by pg_cron if it is installed
--      and on demand by an admin. It reads the weights from the edition's
--      config, refuses to run on a set that does not total 100, and writes
--      t42_scores, t42_duo_scores and t42_weekly_reviews. Nothing else
--      writes those tables — the app only reads them.
--
--  Every *_pct column in t42_scores is that component's SCORE out of 100,
--  not the raw change: a 3% weight loss against a 6% target is weight_pct
--  50. The raw numbers stay in t42_measurements where they came from.
-- ═══════════════════════════════════════════════════════════════


-- ── columns the scorer needs ────────────────────────────────────
alter table public.t42_scores add column if not exists consistency_total numeric(6,2);
alter table public.t42_scores add column if not exists rank_consistency  int;
alter table public.t42_scores add column if not exists steps_pct         numeric(6,2);
alter table public.t42_scores add column if not exists rush_improve_pct  numeric(6,2);
alter table public.t42_scores add column if not exists eligible          boolean not null default false;
-- Why someone is not ranked, in words an admin can act on.
alter table public.t42_scores add column if not exists note              text;
create index if not exists t42_scores_consistency
  on public.t42_scores (challenge_id, consistency_total desc);


-- ═══════════════════════════════════════════════════════════════
--  1 · GUARDS
--
--  Each one lets staff and the server (auth.uid() is null under the
--  service role and pg_cron) straight through. They exist to stop a
--  member's browser, not the people running the challenge.
-- ═══════════════════════════════════════════════════════════════

-- ── a verification code the server issues ───────────────────────
create or replace function public.t42_new_verify_code(p_challenge uuid)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_code text; v_try int := 0;
begin
  loop
    v_code := 'T42-' || (10000 + floor(random() * 90000))::int::text;
    exit when not exists (
      select 1 from public.t42_registrations
       where challenge_id = p_challenge and verify_code = v_code);
    v_try := v_try + 1;
    if v_try > 50 then raise exception 'Could not issue a verification code'; end if;
  end loop;
  return v_code;
end $$;


-- ── registration ────────────────────────────────────────────────
-- Only while registration is open, only as pending, never already in a
-- duo, and with a code the server chose.
create or replace function public.t42_guard_registration()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_status text; v_closes date;
begin
  if auth.uid() is null or public.t42_is_staff() then return new; end if;

  select status, reg_closes_on into v_status, v_closes
    from public.t42_challenges where id = new.challenge_id;
  if v_status is null or v_status not in ('registration','running') then
    raise exception 'Registration for this T42 is closed' using errcode = 'check_violation';
  end if;
  if v_closes is not null and current_date > v_closes then
    raise exception 'Registration for this T42 closed on %', v_closes using errcode = 'check_violation';
  end if;

  new.status       := 'pending';
  new.duo_id       := null;       -- pairing is its own flow, not a column a browser sets
  new.joined_at    := now();
  new.completed_at := null;
  new.verify_code  := public.t42_new_verify_code(new.challenge_id);
  return new;
end $$;

drop trigger if exists t42_guard_registration_ins on public.t42_registrations;
create trigger t42_guard_registration_ins
  before insert on public.t42_registrations
  for each row execute function public.t42_guard_registration();


-- ── the day's rows: check-ins and workouts ──────────────────────
-- Today, or the morning after. A check-in for day 5 written on day 30 is
-- not a check-in, it is an edit to history. Dates are the server's.
--
-- Counted in REAL days since the start, not with t42_day_no(), which stops
-- at 42. Using the capped number meant day 42 stayed "today" for ever after
-- the challenge ended, and a member could keep topping it up in December.
create or replace function public.t42_guard_day()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_start date; v_total int; v_status text; v_day int;
begin
  if auth.uid() is null or public.t42_is_staff() then return new; end if;

  select ch.starts_on, ch.total_days, ch.status into v_start, v_total, v_status
    from public.t42_registrations r
    join public.t42_challenges ch on ch.id = r.challenge_id
   where r.id = new.registration_id;
  if v_status = 'complete' then
    raise exception 'This T42 has finished' using errcode = 'check_violation';
  end if;
  v_day := current_date - v_start + 1;

  if v_day < 1 then
    raise exception 'T42 has not started yet' using errcode = 'check_violation';
  end if;
  if new.day_no > v_total or (new.day_no <> v_day and new.day_no <> v_day - 1) then
    raise exception 'Day % can only be logged on that day or the morning after', new.day_no
      using errcode = 'check_violation';
  end if;

  if tg_table_name = 't42_daily_checkins' then
    new.on_date := v_start + (new.day_no - 1);
    if tg_op = 'INSERT' then new.created_at := now(); else new.created_at := old.created_at; end if;
    new.updated_at := now();
  else
    new.completed_at := now();
  end if;
  return new;
end $$;

drop trigger if exists t42_guard_checkin on public.t42_daily_checkins;
create trigger t42_guard_checkin
  before insert or update on public.t42_daily_checkins
  for each row execute function public.t42_guard_day();

drop trigger if exists t42_guard_workout on public.t42_workout_completions;
create trigger t42_guard_workout
  before insert or update on public.t42_workout_completions
  for each row execute function public.t42_guard_day();


-- ── RUSH claims ─────────────────────────────────────────────────
-- A week that has not started cannot have a race in it, and a changed time
-- goes back to being unchecked.
create or replace function public.t42_guard_rush()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_ch uuid; v_day int;
begin
  if auth.uid() is null or public.t42_is_staff() then return new; end if;

  select challenge_id into v_ch from public.t42_registrations where id = new.registration_id;
  v_day := coalesce(public.t42_day_no(v_ch), 0);
  if v_day = 0 or new.week_no > ceil(v_day / 7.0) then
    raise exception 'That RUSH week has not started' using errcode = 'check_violation';
  end if;

  if tg_op = 'INSERT' then
    new.verify_status   := 'pending';
    new.improvement_pct := null;
  else
    new.improvement_pct := old.improvement_pct;
    new.verify_status   := case
      when new.time_sec  is distinct from old.time_sec
        or new.completed is distinct from old.completed then 'pending'
      else old.verify_status end;
  end if;
  return new;
end $$;

drop trigger if exists t42_guard_rush on public.t42_rush_results;
create trigger t42_guard_rush
  before insert or update on public.t42_rush_results
  for each row execute function public.t42_guard_rush();


-- ── measurements ────────────────────────────────────────────────
-- The one that matters most. A member may:
--   · set weight, waist and height on their baseline until day 3
--   · set their baseline fitness test until day 7
--   · take the mid-point between day 21 and day 38
--   · take the final from day 39
--   · add or replace photos on any of them, any time before sign-off
-- A member may NEVER set body composition (that is the InBody's, entered
-- by a coach), the source, or anything to do with verification.
create or replace function public.t42_guard_measurement()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_ch uuid; v_total int; v_cfg jsonb; v_day int; v_status text;
  v_lock int; v_fit_lock int; v_mid int; v_final int;
  v_body boolean; v_fit boolean; v_photo boolean;
begin
  if auth.uid() is null or public.t42_is_staff() then
    new.updated_at := now();
    return new;
  end if;

  select r.challenge_id, ch.total_days, ch.config, ch.status into v_ch, v_total, v_cfg, v_status
    from public.t42_registrations r
    join public.t42_challenges ch on ch.id = r.challenge_id
   where r.id = new.registration_id;
  -- Once the results are out, the numbers behind them are closed.
  if v_status = 'complete' then
    raise exception 'This T42 has finished' using errcode = 'check_violation';
  end if;
  v_day      := coalesce(public.t42_day_no(v_ch), 0);
  v_lock     := coalesce((v_cfg->>'baseline_lock_day')::int, 3);
  v_fit_lock := coalesce((v_cfg->>'baseline_fitness_lock_day')::int, 7);
  v_mid      := round(v_total / 2.0)::int;
  v_final    := greatest(1, v_total - 3);

  if tg_op = 'INSERT' then
    new.source         := 'self';
    new.body_fat_pct   := null;  new.muscle_mass_kg := null;
    new.visceral_fat   := null;  new.inbody_score   := null;
    new.verified_by    := null;  new.verified_at    := null;  new.verify_note := null;
    -- A final goes straight into the verification queue.
    new.verify_status  := case when new.phase = 'final' then 'pending' else 'none' end;
    new.taken_on       := current_date;
    new.created_at     := now();
    v_body := true;
    v_fit  := coalesce(new.fitness, '{}'::jsonb) <> '{}'::jsonb;
  else
    -- Identity of the row cannot move.
    new.registration_id := old.registration_id;
    new.phase           := old.phase;
    -- Nor can anything a member does not own.
    new.source         := old.source;
    new.body_fat_pct   := old.body_fat_pct;   new.muscle_mass_kg := old.muscle_mass_kg;
    new.visceral_fat   := old.visceral_fat;   new.inbody_score   := old.inbody_score;
    new.verified_by    := old.verified_by;    new.verified_at    := old.verified_at;
    new.verify_note    := old.verify_note;
    new.created_at     := old.created_at;

    v_body  := new.weight_kg is distinct from old.weight_kg
            or new.waist_cm  is distinct from old.waist_cm
            or new.height_cm is distinct from old.height_cm;
    v_fit   := new.fitness is distinct from old.fitness;
    v_photo := new.photo_front is distinct from old.photo_front
            or new.photo_side  is distinct from old.photo_side
            or new.photo_back  is distinct from old.photo_back;

    new.taken_on := case when v_body then current_date else old.taken_on end;
    -- Something sent back for resubmission, and then changed, is back in
    -- the queue. Anything else keeps the status a reviewer gave it.
    new.verify_status := case
      when old.verify_status = 'resubmit' and (v_body or v_fit or v_photo) then 'pending'
      else old.verify_status end;
  end if;

  if new.phase = 'baseline' then
    if v_body and v_day > v_lock then
      raise exception 'The baseline closed on day %', v_lock using errcode = 'check_violation';
    end if;
    if v_fit and v_day > v_fit_lock then
      raise exception 'The baseline fitness test closed on day %', v_fit_lock
        using errcode = 'check_violation';
    end if;
  elsif new.phase = 'mid' then
    if (v_body or v_fit) and (v_day < v_mid or v_day >= v_final) then
      raise exception 'The mid-point is open from day % to day %', v_mid, v_final - 1
        using errcode = 'check_violation';
    end if;
  elsif new.phase = 'final' then
    if (v_body or v_fit) and v_day < v_final then
      raise exception 'The final assessment opens on day %', v_final using errcode = 'check_violation';
    end if;
  end if;

  new.updated_at := now();
  return new;
end $$;

drop trigger if exists t42_guard_measurement on public.t42_measurements;
create trigger t42_guard_measurement
  before insert or update on public.t42_measurements
  for each row execute function public.t42_guard_measurement();


-- ═══════════════════════════════════════════════════════════════
--  2 · THE SCORER
-- ═══════════════════════════════════════════════════════════════

-- 0–100, and nothing either side of it.
create or replace function public.t42_clamp(p numeric)
returns numeric language sql immutable as $$
  select greatest(0, least(100, coalesce(p, 0)));
$$;

-- One weight out of the edition's config. A missing weight is zero, and
-- the scorer has already refused to run if the set does not total 100.
create or replace function public.t42_w(p_cfg jsonb, p_set text, p_key text)
returns numeric language sql immutable as $$
  select coalesce((p_cfg -> p_set ->> p_key)::numeric, 0);
$$;


-- Gym attendance comes from HITFAT Club, which may not be deployed. Until
-- 26-t42-gym.sql replaces it, this answers NULL — "not connected" — and the
-- scorer marks gym participants ineligible rather than scoring them on a
-- zero that is really a missing table. Created only if absent, so re-running
-- this file cannot put the stub back over the real one.
do $do$
begin
  if to_regprocedure('public.t42_gym_attended(uuid,date,date)') is null then
    execute 'create function public.t42_gym_attended(p_user uuid, p_from date, p_to date) '
         || 'returns int language sql stable as ''select null::int''';
  end if;
end
$do$;

create or replace function public.t42_compute_scores(p_challenge uuid)
returns int language plpgsql security definer set search_path = public as $$
declare
  ch      public.t42_challenges%rowtype;
  v_day   int;
  v_week  int;
  v_final boolean;
  v_sc    jsonb;
  v_tg    jsonb;
  v_steps int;
  v_bad   text;
  v_n     int;
begin
  select * into ch from public.t42_challenges where id = p_challenge;
  if not found then raise exception 'No T42 challenge %', p_challenge; end if;

  v_day := coalesce(public.t42_day_no(p_challenge), 0);
  if v_day = 0 then return 0; end if;           -- nothing to score before day 1
  v_week  := ceil(v_day / 7.0)::int;
  v_final := ch.status in ('assessment','complete');
  v_sc    := coalesce(ch.config -> 'scoring', '{}'::jsonb);
  v_tg    := coalesce(ch.config -> 'targets', '{}'::jsonb);
  v_steps := coalesce((ch.config ->> 'step_target')::int, 8000);

  -- Refuse, loudly, rather than rank people by weights nobody chose.
  if not (v_sc ? 'online_transform' and v_sc ? 'gym_transform'
          and v_sc ? 'perform' and v_sc ? 'consistency') then
    raise exception 'T42 scoring config is missing a weight set';
  end if;
  select string_agg(t.k || ' = ' || t.total, ', ') into v_bad
    from (select s.key as k,
                 (select coalesce(sum(x.value::numeric), 0) from jsonb_each_text(s.value) x) as total
            from jsonb_each(v_sc) s) t
   where t.total <> 100;
  if v_bad is not null then
    raise exception 'T42 scoring weights must total 100: %', v_bad;
  end if;


  -- ── the weekly reviews, first, because consistency reads them ──
  -- Workouts are counted against what the plan asked for that week, not
  -- against seven: START trains three days a week and should be able to
  -- score 100 without training on its rest days.
  insert into public.t42_weekly_reviews
    (registration_id, week_no, workouts_done, workouts_target, checkins_done,
     steps_total, nutrition_days, rush_completed, week_score, computed_at)
  select r.id, wk.week_no,
         coalesce(wd.cnt, 0), coalesce(pl.cnt, 0), coalesce(ck.cnt, 0),
         coalesce(ck.steps, 0), coalesce(ck.nut, 0),
         coalesce(ru.done, false),
         round(100 * (
             0.4 * case when coalesce(pl.cnt, 0) = 0 then 1
                        else least(1, coalesce(wd.cnt, 0)::numeric / pl.cnt) end
           + 0.3 * least(1, coalesce(ck.cnt, 0)::numeric      / wk.elapsed)
           + 0.2 * least(1, coalesce(ck.stepdays, 0)::numeric / wk.elapsed)
           + 0.1 * least(1, coalesce(ck.nut, 0)::numeric      / wk.elapsed)), 2),
         now()
    from public.t42_registrations r
    cross join lateral (
      select g as week_no,
             (g - 1) * 7 + 1                          as d_from,
             least(g * 7, ch.total_days, v_day)       as d_to,
             greatest(1, least(g * 7, ch.total_days, v_day) - ((g - 1) * 7 + 1) + 1) as elapsed
        from generate_series(1, v_week) g
    ) wk
    left join lateral (
      select count(*) as cnt from public.t42_plan_days pd
       where pd.challenge_id = ch.id and pd.track = r.track
         and pd.day_no between wk.d_from and wk.d_to
    ) pl on true
    left join lateral (
      select count(*) as cnt from public.t42_workout_completions x
       where x.registration_id = r.id and x.day_no between wk.d_from and wk.d_to
    ) wd on true
    left join lateral (
      select count(*) as cnt,
             sum(coalesce(x.steps, 0)) as steps,
             count(*) filter (where x.nutrition = 'on_track') as nut,
             count(*) filter (where x.steps >= coalesce(tw.step_target, v_steps)) as stepdays
        from public.t42_daily_checkins x
        left join public.t42_weeks tw on tw.challenge_id = ch.id and tw.week_no = wk.week_no
       where x.registration_id = r.id and x.day_no between wk.d_from and wk.d_to
    ) ck on true
    left join lateral (
      select bool_or(x.completed and x.verify_status <> 'flagged') as done
        from public.t42_rush_results x
       where x.registration_id = r.id and x.week_no = wk.week_no
    ) ru on true
   where r.challenge_id = ch.id
     and r.status not in ('withdrawn','disqualified')
  on conflict (registration_id, week_no) do update set
    workouts_done   = excluded.workouts_done,
    workouts_target = excluded.workouts_target,
    checkins_done   = excluded.checkins_done,
    steps_total     = excluded.steps_total,
    nutrition_days  = excluded.nutrition_days,
    rush_completed  = excluded.rush_completed,
    week_score      = excluded.week_score,
    computed_at     = now();


  -- ── every participant's components ──
  with base as (
    select r.id as reg_id, r.mode, r.track, r.gender, r.status, r.duo_id,
           b.weight_kg as b_w, b.waist_cm as b_c, b.body_fat_pct as b_bf,
           lt.weight_kg as l_w, lt.waist_cm as l_c, lt.body_fat_pct as l_bf,
           fn.id as f_id, fn.verify_status as f_vs, fn.body_fat_pct as f_bf,
           act.wk_done, act.wk_plan, act.ck_done, act.step_days, act.rush_done, act.good_weeks,
           act.gym_att,
           ri.imp as rush_imp, fi.imp as fit_imp
      from public.t42_registrations r
      left join public.t42_measurements b
             on b.registration_id = r.id and b.phase = 'baseline'
      left join public.t42_measurements fn
             on fn.registration_id = r.id and fn.phase = 'final'
      -- "Now" is the final if there is one, else the mid-point — and never
      -- a measurement a reviewer has flagged or sent back.
      left join lateral (
        select m.weight_kg, m.waist_cm, m.body_fat_pct, m.fitness
          from public.t42_measurements m
         where m.registration_id = r.id and m.phase in ('mid','final')
           and m.verify_status not in ('flagged','resubmit')
         order by case m.phase when 'final' then 1 else 2 end
         limit 1
      ) lt on true
      cross join lateral (
        select
          (select count(*) from public.t42_workout_completions x
            where x.registration_id = r.id and x.day_no <= v_day)                   as wk_done,
          (select count(*) from public.t42_plan_days pd
            where pd.challenge_id = ch.id and pd.track = r.track and pd.day_no <= v_day) as wk_plan,
          (select count(*) from public.t42_daily_checkins x
            where x.registration_id = r.id and x.day_no <= v_day)                   as ck_done,
          (select count(*) from public.t42_daily_checkins x
             left join public.t42_weeks tw
                    on tw.challenge_id = ch.id and tw.week_no = ceil(x.day_no / 7.0)::int
            where x.registration_id = r.id and x.day_no <= v_day
              and x.steps >= coalesce(tw.step_target, v_steps))                      as step_days,
          (select count(*) from public.t42_rush_results x
            where x.registration_id = r.id and x.completed
              and x.verify_status <> 'flagged' and x.week_no <= v_week)             as rush_done,
          -- Weeks that are over, scored 70 or better.
          (select count(*) from public.t42_weekly_reviews w
            where w.registration_id = r.id and w.week_no < v_week and w.week_score >= 70) as good_weeks,
          -- Classes attended at HQ during the challenge. Each one is a coach
          -- scanning the member's QR at the counter, so it is verified by the
          -- act of being recorded.
          case when r.mode = 'gym_duo'
               then public.t42_gym_attended(r.user_id, ch.starts_on,
                      least(current_date, ch.starts_on + ch.total_days - 1)) end as gym_att
      ) act
      -- RUSH improvement: the first recorded time against the best since.
      left join lateral (
        select (fst.time_sec - min(x.time_sec))::numeric / nullif(fst.time_sec, 0) * 100 as imp
          from (select rr.time_sec, rr.week_no from public.t42_rush_results rr
                 where rr.registration_id = r.id and rr.completed and rr.time_sec > 0
                   and rr.verify_status <> 'flagged'
                 order by rr.week_no limit 1) fst
          join public.t42_rush_results x
            on x.registration_id = r.id and x.completed and x.time_sec > 0
           and x.verify_status <> 'flagged' and x.week_no > fst.week_no
         group by fst.time_sec
      ) ri on true
      -- Fitness: the average improvement across whichever tests were taken
      -- both times. Faster is better for the run; more is better for the rest.
      left join lateral (
        select avg(case when k.key = 'run1k_sec'
                        then ((b.fitness ->> k.key)::numeric - (lt.fitness ->> k.key)::numeric)
                             / (b.fitness ->> k.key)::numeric
                        else ((lt.fitness ->> k.key)::numeric - (b.fitness ->> k.key)::numeric)
                             / (b.fitness ->> k.key)::numeric
                   end) * 100 as imp
          from jsonb_object_keys(coalesce(b.fitness, '{}'::jsonb)) as k(key)
         where jsonb_typeof(b.fitness -> k.key) = 'number'
           and jsonb_typeof(lt.fitness -> k.key) = 'number'
           and (b.fitness ->> k.key)::numeric > 0
      ) fi on true
     where r.challenge_id = ch.id
  ),
  pcts as (
    select base.*,
      case when b_w > 0 and l_w is not null then (b_w - l_w) / b_w * 100 end as w_loss,
      case when b_c > 0 and l_c is not null then (b_c - l_c) / b_c * 100 end as c_loss,
      case when b_bf is not null and l_bf is not null then b_bf - l_bf end  as bf_drop,
      case when wk_plan = 0 then 100 else least(100, wk_done * 100.0 / wk_plan) end as workout_s,
      least(100, ck_done   * 100.0 / v_day)  as checkin_s,
      least(100, step_days * 100.0 / v_day)  as steps_s,
      least(100, rush_done * 100.0 / v_week) as rush_s,
      case when v_week > 1 then least(100, good_weeks * 100.0 / (v_week - 1)) else 0 end as weekly_s,
      -- Against the sessions a week the edition asks for, pro-rated to today.
      case when gym_att is null then null
           else least(100, gym_att * 100.0 /
                greatest(1, coalesce((ch.config ->> 'gym_sessions_per_week')::numeric, 3) * v_day / 7.0))
      end as attendance_s
    from base
  ),
  scored as (
    select pcts.*,
      public.t42_clamp(coalesce(w_loss, 0)   / coalesce((v_tg ->> 'weight_loss_pct')::numeric, 6)      * 100) as weight_s,
      public.t42_clamp(coalesce(c_loss, 0)   / coalesce((v_tg ->> 'waist_loss_pct')::numeric, 8)       * 100) as waist_s,
      public.t42_clamp(coalesce(bf_drop, 0)  / coalesce((v_tg ->> 'bodyfat_drop_pts')::numeric, 3)     * 100) as bodyfat_s,
      public.t42_clamp(coalesce(fit_imp, 0)  / coalesce((v_tg ->> 'fitness_improve_pct')::numeric, 25) * 100) as fitness_s,
      public.t42_clamp(coalesce(rush_imp, 0) / coalesce((v_tg ->> 'rush_improve_pct')::numeric, 10)    * 100) as rushimp_s
    from pcts
  ),
  totals as (
    select scored.*,
      -- Everyone has a consistency score: it is its own leaderboard, and it
      -- is START's only one.
      ( workout_s * public.t42_w(v_sc, 'consistency', 'workout_pct')
      + checkin_s * public.t42_w(v_sc, 'consistency', 'checkin_pct')
      + steps_s   * public.t42_w(v_sc, 'consistency', 'steps_pct')
      + rush_s    * public.t42_w(v_sc, 'consistency', 'rush_pct')
      + weekly_s  * public.t42_w(v_sc, 'consistency', 'weekly_pct') ) / 100 as cons_total,
      case
        when track = 'start' then null
        -- PERFORM is judged on improvement from the participant's own
        -- baseline, so the fittest person on day one has no head start.
        when track = 'perform' then
          ( fitness_s * public.t42_w(v_sc, 'perform', 'fitness_pct')
          + rushimp_s * public.t42_w(v_sc, 'perform', 'rush_pct')
          + workout_s * public.t42_w(v_sc, 'perform', 'workout_pct')
          + checkin_s * public.t42_w(v_sc, 'perform', 'consistency_pct') ) / 100
        -- Gym: body fat from the InBody, and attendance from Club check-ins.
        -- If attendance is not connected it is NULL, scored as zero here, and
        -- the participant is marked ineligible below rather than ranked on it.
        when mode = 'gym_duo' then
          ( bodyfat_s * public.t42_w(v_sc, 'gym_transform', 'bodyfat_pct')
          + (weight_s + waist_s) / 2 * public.t42_w(v_sc, 'gym_transform', 'weight_waist_pct')
          + coalesce(attendance_s, 0) * public.t42_w(v_sc, 'gym_transform', 'attendance_pct')
          + checkin_s * public.t42_w(v_sc, 'gym_transform', 'consistency_pct')
          + rush_s    * public.t42_w(v_sc, 'gym_transform', 'rush_pct') ) / 100
        else
          ( weight_s  * public.t42_w(v_sc, 'online_transform', 'weight_pct')
          + waist_s   * public.t42_w(v_sc, 'online_transform', 'waist_pct')
          + workout_s * public.t42_w(v_sc, 'online_transform', 'workout_pct')
          + checkin_s * public.t42_w(v_sc, 'online_transform', 'consistency_pct')
          + rush_s    * public.t42_w(v_sc, 'online_transform', 'rush_pct') ) / 100
      end as main_total
    from scored
  ),
  placed as (
    select totals.*,
      case
        when gender is null     then null
        when track = 'start'    then 'consistency'
        when mode = 'gym_duo'   then 'gym_' || track || '_' || gender
        else track || '_' || gender
      end as cat,
      case
        when status in ('withdrawn','disqualified') then 'Status is ' || status
        when b_w is null or b_c is null             then 'No complete baseline'
        when gender is null                          then 'No category chosen'
        when mode = 'gym_duo' and attendance_s is null then 'Gym attendance is not connected yet'
        -- A duo competition is judged as a duo. Alone, there is nothing to rank.
        when mode = 'gym_duo' and duo_id is null     then 'Not in a duo'
        -- TRANSFORM at the gym is 40% body fat. Without an InBody at the start
        -- there is no line to measure it from.
        when mode = 'gym_duo' and track = 'transform' and b_bf is null then 'No baseline InBody'
        when v_final and f_id is null                then 'No final assessment'
        when v_final and mode = 'gym_duo' and track = 'transform' and f_bf is null then 'No final InBody'
        when v_final and f_vs not in ('pending','verified') then 'Final is ' || f_vs
      end as why
    from totals
  )
  insert into public.t42_scores
    (registration_id, challenge_id, weight_pct, waist_pct, bodyfat_pct, workout_pct,
     consistency_pct, attendance_pct, rush_pct, fitness_pct, steps_pct, rush_improve_pct,
     total, consistency_total, category, eligible, note, is_final, computed_at)
  select reg_id, ch.id,
         round(weight_s, 2), round(waist_s, 2), round(bodyfat_s, 2), round(workout_s, 2),
         round(checkin_s, 2), round(attendance_s, 2), round(rush_s, 2), round(fitness_s, 2),
         round(steps_s, 2), round(rushimp_s, 2),
         round(coalesce(case when track = 'start' then cons_total else main_total end, 0), 2),
         round(cons_total, 2),
         cat, why is null, why, v_final, now()
    from placed
  on conflict (registration_id) do update set
    weight_pct        = excluded.weight_pct,
    waist_pct         = excluded.waist_pct,
    bodyfat_pct       = excluded.bodyfat_pct,
    workout_pct       = excluded.workout_pct,
    consistency_pct   = excluded.consistency_pct,
    attendance_pct    = excluded.attendance_pct,
    rush_pct          = excluded.rush_pct,
    fitness_pct       = excluded.fitness_pct,
    steps_pct         = excluded.steps_pct,
    rush_improve_pct  = excluded.rush_improve_pct,
    total             = excluded.total,
    consistency_total = excluded.consistency_total,
    category          = excluded.category,
    eligible          = excluded.eligible,
    note              = excluded.note,
    is_final          = excluded.is_final,
    computed_at       = now();
  get diagnostics v_n = row_count;


  -- ── ranks ──
  -- Ties are broken by workout completion, then check-ins: two people on
  -- the same total, the one who did more of the work places higher.
  update public.t42_scores
     set rank_category = null, rank_consistency = null, rank_overall = null
   where challenge_id = ch.id;

  update public.t42_scores sc set rank_category = x.rk
    from (select registration_id,
                 rank() over (partition by category
                              order by total desc, workout_pct desc, consistency_pct desc) as rk
            from public.t42_scores
           where challenge_id = ch.id and eligible) x
   where sc.registration_id = x.registration_id;

  update public.t42_scores sc set rank_consistency = x.rk
    from (select registration_id,
                 rank() over (order by consistency_total desc, workout_pct desc) as rk
            from public.t42_scores
           where challenge_id = ch.id and eligible) x
   where sc.registration_id = x.registration_id;


  -- ── duos: the average of two percentages, never a sum of kilograms ──
  insert into public.t42_duo_scores
    (duo_id, challenge_id, a_total, b_total, team_total, eligible, category, is_final, computed_at)
  select du.id, ch.id, pr.a_total, pr.b_total,
         coalesce(round((pr.a_total + pr.b_total) / 2, 2), 0),
         pr.cnt = 2 and pr.all_ok,
         'duo_' || replace(coalesce(pr.cat, 'unplaced'), 'gym_', ''),
         v_final, now()
    from public.t42_duos du
    join lateral (
      select count(*) as cnt,
             (array_agg(s.total order by r.joined_at))[1] as a_total,
             (array_agg(s.total order by r.joined_at))[2] as b_total,
             bool_and(s.eligible) as all_ok,
             min(s.category) as cat
        from public.t42_registrations r
        join public.t42_scores s on s.registration_id = r.id
       where r.duo_id = du.id
    ) pr on pr.cnt > 0
   where du.challenge_id = ch.id
  on conflict (duo_id) do update set
    a_total     = excluded.a_total,
    b_total     = excluded.b_total,
    team_total  = excluded.team_total,
    eligible    = excluded.eligible,
    category    = excluded.category,
    is_final    = excluded.is_final,
    computed_at = now();

  -- Pairs are fixed from the day the baseline closes. A duo that could
  -- still swap a partner on day 30 is a duo that could shop for a score.
  if v_day > coalesce((ch.config ->> 'baseline_lock_day')::int, 3) then
    update public.t42_duos set locked_at = now()
     where challenge_id = ch.id and locked_at is null;
  end if;

  update public.t42_duo_scores ds set rank_category = x.rk
    from (select duo_id,
                 case when eligible
                      then rank() over (partition by category, eligible order by team_total desc) end as rk
            from public.t42_duo_scores
           where challenge_id = ch.id) x
   where ds.duo_id = x.duo_id;

  return v_n;
end $$;


-- Every running edition, for the hourly job.
create or replace function public.t42_compute_all()
returns int language plpgsql security definer set search_path = public as $$
declare v_ch record; v_sum int := 0;
begin
  for v_ch in select id from public.t42_challenges where status in ('running','assessment') loop
    v_sum := v_sum + public.t42_compute_scores(v_ch.id);
  end loop;
  return v_sum;
end $$;


-- What an admin presses. The only public door into the scorer, and it
-- leaves a note every time it is opened.
create or replace function public.t42_recompute(p_challenge uuid)
returns int language plpgsql security definer set search_path = public as $$
declare v_n int;
begin
  if not public.t42_is_admin() then
    raise exception 'Only an admin can recompute T42 scores' using errcode = 'insufficient_privilege';
  end if;
  v_n := public.t42_compute_scores(p_challenge);
  insert into public.t42_admin_notes (challenge_id, action, detail, acted_by)
  values (p_challenge, 'recompute', v_n || ' participants scored', auth.uid());
  return v_n;
end $$;


-- ═══════════════════════════════════════════════════════════════
--  3 · WHAT THE LEADERBOARD MAY SAY
--
--  A first name and an initial, a rank, a total. Not the weight, not the
--  waist, not the body fat, not a photo, and not the email address — an
--  empty profile name falls back to "Participant", never to the part of an
--  email before the @, which is how people are found.
-- ═══════════════════════════════════════════════════════════════
create or replace function public.t42_display_name(p_user uuid)
returns text language plpgsql stable security definer set search_path = public as $$
declare v_name text; v_parts text[];
begin
  select trim(coalesce(raw_user_meta_data ->> 'name', raw_user_meta_data ->> 'full_name', ''))
    into v_name from auth.users where id = p_user;
  if v_name is null or v_name = '' then return 'Participant'; end if;
  v_parts := regexp_split_to_array(v_name, '\s+');
  if array_length(v_parts, 1) = 1 then return v_parts[1]; end if;
  return v_parts[1] || ' ' || left(v_parts[array_length(v_parts, 1)], 1) || '.';
end $$;

create or replace function public.t42_leaderboard(p_challenge uuid, p_category text, p_limit int default 10)
returns table (place int, display_name text, score numeric, is_me boolean)
language sql stable security definer set search_path = public as $$
  select case when p_category = 'consistency' then s.rank_consistency else s.rank_category end,
         public.t42_display_name(r.user_id),
         case when p_category = 'consistency' then s.consistency_total else s.total end,
         r.user_id = auth.uid()
    from public.t42_scores s
    join public.t42_registrations r on r.id = s.registration_id
   where s.challenge_id = p_challenge
     and s.eligible
     and (p_category = 'consistency' or s.category = p_category)
     and auth.uid() is not null
   order by 1 asc nulls last, 3 desc
   limit least(greatest(coalesce(p_limit, 10), 1), 50);
$$;

-- For the admin screen: the people behind the scores. Staff only — the
-- function returns nothing at all to anyone else.
create or replace function public.t42_admin_participants(p_challenge uuid)
returns table (registration_id uuid, user_id uuid, full_name text, email text,
               mode text, track text, gender text, status text, verify_code text,
               joined_at timestamptz, baseline_ok boolean, final_status text,
               total numeric, consistency_total numeric, category text,
               eligible boolean, rank_category int, note text)
language sql stable security definer set search_path = public as $$
  select r.id, r.user_id,
         coalesce(nullif(trim(coalesce(u.raw_user_meta_data ->> 'name',
                                       u.raw_user_meta_data ->> 'full_name', '')), ''),
                  split_part(u.email, '@', 1)),
         u.email, r.mode, r.track, r.gender, r.status, r.verify_code, r.joined_at,
         (b.weight_kg is not null and b.waist_cm is not null),
         fn.verify_status,
         s.total, s.consistency_total, s.category, s.eligible, s.rank_category, s.note
    from public.t42_registrations r
    join auth.users u on u.id = r.user_id
    left join public.t42_measurements b  on b.registration_id  = r.id and b.phase  = 'baseline'
    left join public.t42_measurements fn on fn.registration_id = r.id and fn.phase = 'final'
    left join public.t42_scores s on s.registration_id = r.id
   where r.challenge_id = p_challenge
     and public.t42_is_staff()
   order by s.category nulls last, s.rank_category nulls last, r.joined_at;
$$;


-- ═══════════════════════════════════════════════════════════════
--  4 · WHO MAY CALL WHAT
--
--  Postgres grants EXECUTE to PUBLIC by default, and Supabase exposes
--  every public function as an RPC. Without these lines anyone with the
--  anon key could run the scorer directly.
-- ═══════════════════════════════════════════════════════════════
revoke all on function public.t42_compute_scores(uuid)       from public, anon, authenticated;
revoke all on function public.t42_compute_all()              from public, anon, authenticated;
revoke all on function public.t42_new_verify_code(uuid)      from public, anon, authenticated;
revoke all on function public.t42_display_name(uuid)         from public, anon, authenticated;

revoke all   on function public.t42_recompute(uuid)                 from public, anon;
grant execute on function public.t42_recompute(uuid)                to authenticated;
revoke all   on function public.t42_leaderboard(uuid, text, int)    from public, anon;
grant execute on function public.t42_leaderboard(uuid, text, int)   to authenticated;
revoke all   on function public.t42_admin_participants(uuid)        from public, anon;
grant execute on function public.t42_admin_participants(uuid)       to authenticated;


-- ═══════════════════════════════════════════════════════════════
--  5 · HOURLY
--
--  pg_cron if the project has it (Database → Extensions). Without it the
--  scores only move when an admin presses Recompute, which is fine for a
--  pilot and wrong for a leaderboard people refresh.
-- ═══════════════════════════════════════════════════════════════
do $do$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('t42-scores-hourly', '7 * * * *', 'select public.t42_compute_all()');
  end if;
end
$do$;
