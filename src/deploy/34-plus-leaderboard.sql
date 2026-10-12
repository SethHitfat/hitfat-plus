-- ═══════════════════════════════════════════════════════════════
--  HITFAT+ · LEADERBOARDS
--  Run after 33-plus-landing.sql. Safe to run again.
--
--  Two boards, read from what people already log (plus_data.data):
--    · the monthly challenge — distinct days trained this month,
--      Malaysian dates, minutes trained to break a tie;
--    · BURN30 — the program day reached (data.progress.wl30).
--
--  Only a first name is shown (prefs.name, first word), or "Member".
--  Anyone can leave the boards (prefs.lbHide = true): they are not listed
--  and not counted in anyone else's rank, but still see their own place.
--  The callers get the top 50 and their own row, nothing else about
--  anybody: no ids, no emails, no other data.
--
--  plus_data is written by the app, so a determined person could inflate
--  their own count. These boards are for encouragement, not prizes; a
--  board with a prize should count from a server-side record instead.
-- ═══════════════════════════════════════════════════════════════

-- A timestamp from text that may not be one.
create or replace function public.plus_try_ts(t text)
returns timestamptz language plpgsql stable as $$
begin
  return t::timestamptz;
exception when others then
  return null;
end $$;

create or replace function public.plus_try_num(t text)
returns numeric language plpgsql immutable as $$
begin
  return t::numeric;
exception when others then
  return null;
end $$;

-- The name a board shows.
create or replace function public.plus_lb_name(d jsonb)
returns text language sql immutable as $$
  select coalesce(nullif(left(split_part(trim(coalesce(d->'prefs'->>'name','')), ' ', 1), 18), ''), 'Member');
$$;

create or replace function public.plus_lb_hidden(d jsonb)
returns boolean language sql immutable as $$
  select coalesce(d->'prefs'->>'lbHide', 'false') = 'true';
$$;

-- ── the monthly challenge ─────────────────────────────────────────
create or replace function public.plus_lb_month(p_month text default null)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_month text := coalesce(nullif(p_month, ''), to_char(now() at time zone 'Asia/Kuala_Lumpur', 'YYYY-MM'));
  v jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in first' using errcode = 'insufficient_privilege'; end if;
  if v_month !~ '^\d{4}-\d{2}$' then raise exception 'Month as YYYY-MM'; end if;

  with s as (
    select d.user_id, public.plus_lb_name(d.data) as name, public.plus_lb_hidden(d.data) as hide,
           x.days, x.mins
      from public.plus_data d
      cross join lateral (
        select count(distinct to_char(public.plus_try_ts(e.value->>'date') at time zone 'Asia/Kuala_Lumpur', 'YYYY-MM-DD')) as days,
               coalesce(sum(coalesce(public.plus_try_num(e.value->>'mins'), 0)), 0) as mins
          from jsonb_each(case when jsonb_typeof(d.data->'sessions') = 'object' then d.data->'sessions' else '{}'::jsonb end) e
         where jsonb_typeof(e.value) = 'object'
           and to_char(public.plus_try_ts(e.value->>'date') at time zone 'Asia/Kuala_Lumpur', 'YYYY-MM') = v_month
      ) x
     where x.days > 0
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

-- ── BURN30 ────────────────────────────────────────────────────────
create or replace function public.plus_lb_burn30()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in first' using errcode = 'insufficient_privilege'; end if;

  with s as (
    select d.user_id, public.plus_lb_name(d.data) as name, public.plus_lb_hidden(d.data) as hide,
           least(30, coalesce(public.plus_try_num(d.data->'progress'->>'wl30'), 0))::int as day,
           (select max(public.plus_try_ts(e.value->>'date'))
              from jsonb_each(case when jsonb_typeof(d.data->'sessions') = 'object' then d.data->'sessions' else '{}'::jsonb end) e
             where e.key like 'wl30-%' and jsonb_typeof(e.value) = 'object') as last_at
      from public.plus_data d
  ), r as (
    select *, rank() over (order by day desc, last_at asc nulls last) as rk
      from s where day > 0 and (not hide or user_id = auth.uid())
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

revoke all    on function public.plus_lb_month(text) from public, anon;
revoke all    on function public.plus_lb_burn30()    from public, anon;
grant execute on function public.plus_lb_month(text) to authenticated;
grant execute on function public.plus_lb_burn30()    to authenticated;
