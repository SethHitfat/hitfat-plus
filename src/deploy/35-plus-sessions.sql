-- ═══════════════════════════════════════════════════════════════
--  HITFAT+ · WORKOUTS RECORDED ON THE SERVER
--  Run after 34-plus-leaderboard.sql. Safe to run again.
--
--  The leaderboards used to count what the app wrote into plus_data,
--  which the app can write anything into. For boards that may carry a
--  prize, a workout now counts only when the server saw it happen:
--
--    · the player calls plus_session_start() when a workout opens and
--      plus_session_finish() when it ends; both stamps are the server's
--      clock, so a date cannot be moved and a length cannot be invented;
--    · it counts (valid) when it lasted at least 4 minutes and at most 4
--      hours, and the member has not already had 5 valid workouts that
--      Malaysian day;
--    · a BURN30 day counts once, and only when it was played, not marked.
--
--  The boards (plus_lb_month, plus_lb_burn30) now read this table. Names
--  and the hide switch still come from the member's own settings.
-- ═══════════════════════════════════════════════════════════════

do $order$
begin
  if to_regprocedure('public.plus_lb_month(text)') is null then
    raise exception 'Run 34-plus-leaderboard.sql first.';
  end if;
end
$order$;

create table if not exists public.plus_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  program      text,                         -- 'wl30', a program id, or null for a single session
  day_index    int,                          -- the program day (0-based), when there is one
  label        text,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  day_my       date not null default ((now() at time zone 'Asia/Kuala_Lumpur')::date),
  valid        boolean not null default false
);
create index if not exists plus_sessions_user_day on public.plus_sessions (user_id, day_my);
create index if not exists plus_sessions_program on public.plus_sessions (program, user_id) where valid;

alter table public.plus_sessions enable row level security;
drop policy if exists plus_sessions_read_own on public.plus_sessions;
create policy plus_sessions_read_own on public.plus_sessions
  for select using (auth.uid() = user_id);
-- No insert/update policy: only the two functions below write.

create or replace function public.plus_session_start(p_program text default null, p_day int default null, p_label text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first' using errcode = 'insufficient_privilege'; end if;
  -- a person starts a workout now and then, not twenty a minute
  if (select count(*) from public.plus_sessions
       where user_id = auth.uid() and started_at > now() - interval '1 minute') >= 5 then
    raise exception 'Too many workouts started at once';
  end if;
  insert into public.plus_sessions (user_id, program, day_index, label)
  values (auth.uid(), nullif(left(coalesce(p_program, ''), 40), ''),
          case when p_day between 0 and 400 then p_day end,
          left(coalesce(p_label, ''), 80))
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.plus_session_finish(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  s public.plus_sessions;
  v_mins numeric;
  v_ok boolean;
begin
  if auth.uid() is null then raise exception 'Sign in first' using errcode = 'insufficient_privilege'; end if;
  select * into s from public.plus_sessions where id = p_id and user_id = auth.uid() for update;
  if not found then raise exception 'No such workout'; end if;
  if s.finished_at is not null then
    return jsonb_build_object('valid', s.valid, 'already', true);
  end if;

  v_mins := extract(epoch from (now() - s.started_at)) / 60;
  v_ok := v_mins >= 4 and v_mins <= 240
      and (select count(*) from public.plus_sessions
            where user_id = auth.uid() and day_my = s.day_my and valid) < 5;
  -- a BURN30 day counts once
  if v_ok and s.program = 'wl30' and s.day_index is not null then
    v_ok := not exists (select 1 from public.plus_sessions
                         where user_id = auth.uid() and program = 'wl30' and day_index = s.day_index and valid);
  end if;

  update public.plus_sessions set finished_at = now(), valid = v_ok where id = s.id;
  return jsonb_build_object('valid', v_ok, 'mins', round(v_mins, 1));
end $$;

revoke all    on function public.plus_session_start(text, int, text) from public, anon;
revoke all    on function public.plus_session_finish(uuid)          from public, anon;
grant execute on function public.plus_session_start(text, int, text) to authenticated;
grant execute on function public.plus_session_finish(uuid)          to authenticated;

-- ── the boards, from the server's record ──────────────────────────
create or replace function public.plus_lb_month(p_month text default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_month text := coalesce(nullif(p_month, ''), to_char(now() at time zone 'Asia/Kuala_Lumpur', 'YYYY-MM'));
  v_from date;
  v jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in first' using errcode = 'insufficient_privilege'; end if;
  if v_month !~ '^\d{4}-\d{2}$' then raise exception 'Month as YYYY-MM'; end if;
  v_from := (v_month || '-01')::date;

  with s as (
    select x.user_id, x.days, x.mins,
           public.plus_lb_name(coalesce(d.data, '{}'::jsonb)) as name,
           public.plus_lb_hidden(coalesce(d.data, '{}'::jsonb)) as hide
      from (select user_id, count(distinct day_my) as days,
                   sum(extract(epoch from (finished_at - started_at)) / 60) as mins
              from public.plus_sessions
             where valid and day_my >= v_from and day_my < (v_from + interval '1 month')::date
             group by user_id) x
      left join public.plus_data d on d.user_id = x.user_id
  ), r as (
    select *, rank() over (order by days desc, mins desc) as rk
      from s where not hide or user_id = auth.uid()
  )
  select jsonb_build_object(
    'month', v_month,
    'count', (select count(*) from r),
    'top', coalesce((select jsonb_agg(jsonb_build_object('rank', rk, 'name', name, 'days', days, 'me', user_id = auth.uid()) order by rk, name)
                       from (select * from r order by rk, name limit 50) t), '[]'::jsonb),
    'me', (select jsonb_build_object('rank', rk, 'days', days, 'hidden', hide) from r where user_id = auth.uid())
  ) into v;
  return v;
end $$;

create or replace function public.plus_lb_burn30()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in first' using errcode = 'insufficient_privilege'; end if;

  with s as (
    select x.user_id, least(30, x.day)::int as day, x.last_at,
           public.plus_lb_name(coalesce(d.data, '{}'::jsonb)) as name,
           public.plus_lb_hidden(coalesce(d.data, '{}'::jsonb)) as hide
      from (select user_id, count(distinct day_index) as day, max(finished_at) as last_at
              from public.plus_sessions
             where valid and program = 'wl30' and day_index is not null
             group by user_id) x
      left join public.plus_data d on d.user_id = x.user_id
  ), r as (
    select *, rank() over (order by day desc, last_at asc) as rk
      from s where not hide or user_id = auth.uid()
  )
  select jsonb_build_object(
    'count', (select count(*) from r),
    'finished', (select count(*) from r where day >= 30),
    'top', coalesce((select jsonb_agg(jsonb_build_object('rank', rk, 'name', name, 'day', day, 'me', user_id = auth.uid()) order by rk, name)
                       from (select * from r order by rk, name limit 50) t), '[]'::jsonb),
    'me', (select jsonb_build_object('rank', rk, 'day', day, 'hidden', hide) from r where user_id = auth.uid())
  ) into v;
  return v;
end $$;
