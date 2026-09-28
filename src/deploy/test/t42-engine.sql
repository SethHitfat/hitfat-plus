\set ON_ERROR_STOP 0
-- Expected results are in expected.out; run.sh diffs against it.
\pset footer off
-- A running, priced edition: day 18 today.
update t42_challenges set price = 99, status = 'running',
  starts_on = t42_today() - 17, ends_on = t42_today() + 24,
  reg_closes_on = t42_today() + 1, results_on = t42_today() + 31, access_ends_on = t42_today() + 31;
insert into auth.users(id,email,raw_user_meta_data) values
 ('00000000-0000-0000-0000-00000000000a','a@x','{"name":"Aina Salleh"}'),
 ('00000000-0000-0000-0000-00000000000b','b@x','{"name":"Beng Tan"}'),
 ('00000000-0000-0000-0000-00000000000c','c@x','{"name":"Chandran R"}');
grant select, insert, update on all tables in schema public to authenticated;

\echo '--- A registers (transform, online) — should succeed'
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into t42_registrations (challenge_id,user_id,mode,track,gender,status)
  select id,auth.uid(),'online_solo','transform','female','pending' from t42_challenges;
\echo '--- A tries gym_duo / start (should FAIL: not offered)'
reset role; set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
insert into t42_registrations (challenge_id,user_id,mode,track,gender,status)
  select id,auth.uid(),'gym_duo','transform','male','pending' from t42_challenges;
insert into t42_registrations (challenge_id,user_id,mode,track,gender,status)
  select id,auth.uid(),'online_solo','start','male','pending' from t42_challenges;
\echo '--- B registers transform (pending, will not pay)'
insert into t42_registrations (challenge_id,user_id,mode,track,gender,status)
  select id,auth.uid(),'online_solo','transform','female','pending' from t42_challenges;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
insert into t42_registrations (challenge_id,user_id,mode,track,gender,status)
  select id,auth.uid(),'online_solo','perform','male','pending' from t42_challenges;
reset role; reset request.jwt.claim.sub;

-- payment lands for A and C (what pay-callback does, as service role)
update t42_registrations set status='paid' where user_id in
  ('00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000c');

select min(day_no) as a_plan_day from t42_plan_days where track='transform' and day_no<=18 \gset
\echo '--- plan visibility: A today-or-earlier (expect >0), A future (expect 0), B (expect 0)'
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select count(*) as a_sees_past_and_today from t42_plan_days where track='transform';
select count(*) as a_sees_future from t42_plan_days where track='transform' and day_no > 18;
select count(*) as a_sees_perform from t42_plan_days where track='perform';
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
select count(*) as b_unpaid_sees from t42_plan_days;
\echo '--- check-in today: B (expect FAIL payment), A (expect ok)'
insert into t42_daily_checkins (registration_id, day_no, steps, water_ml, nutrition)
  select id, 18, 8000, 2000, 'on_track' from t42_registrations where user_id = auth.uid();
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into t42_daily_checkins (registration_id, day_no, steps, water_ml, nutrition)
  select id, 18, 9000, 2000, 'on_track' from t42_registrations where user_id = auth.uid();
reset role; reset request.jwt.claim.sub;

-- history as the server (guards let the service role through)
insert into t42_measurements (registration_id, phase, weight_kg, height_cm, waist_cm, fitness)
  select id, 'baseline', 80, 165, 90, '{"pushups":10,"squats":20,"plank_sec":30}'::jsonb from t42_registrations;
insert into t42_daily_checkins (registration_id, day_no, on_date, steps, water_ml, nutrition)
  select r.id, d, t42_today() - 18 + d, case when r.track='perform' then 5000 else 9000 end, 2000, 'on_track'
    from t42_registrations r, generate_series(1,17) d
   where r.status='paid';
insert into t42_workout_completions (registration_id, day_no)
  select r.id, p.day_no from t42_registrations r join t42_plan_days p
    on p.challenge_id=r.challenge_id and p.track=r.track and p.day_no<=17
   where r.status='paid';

\echo '--- scores (v2)'
select t42_compute_scores(id) from t42_challenges;
select u.email, s.category, s.eligible, s.note, s.compliance_pct, s.progress_pct, s.missions_pct, s.fitness_pct, s.total, s.consistency_total, s.rank_category
  from t42_scores s join t42_registrations r on r.id=s.registration_id join auth.users u on u.id=r.user_id order by u.email;
select u.email, w.week_no, w.mission_done from t42_weekly_reviews w join t42_registrations r on r.id=w.registration_id join auth.users u on u.id=r.user_id order by 1,2;
select t42_phase(id) as phase_now from t42_challenges;

\echo '--- access ended yesterday: plan read (expect 0), check-in (expect FAIL), phase (closed)'
update t42_challenges set ends_on = t42_today()-8, starts_on = t42_today()-49, results_on=t42_today()-1, access_ends_on = t42_today()-1;
select t42_phase(id) as phase_after from t42_challenges;
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
select count(*) as a_sees_after_end from t42_plan_days;
insert into t42_daily_checkins (registration_id, day_no, steps) select id, 42, 1 from t42_registrations where user_id = auth.uid();
select count(*) as a_still_sees_own_scores from t42_scores;
reset role;
\echo '--- legacy edition (no access dates): does NOT close by date'
update t42_challenges set results_on = null, access_ends_on = null;
select t42_access_open(id) as legacy_open, t42_phase(id) as legacy_phase from t42_challenges;
