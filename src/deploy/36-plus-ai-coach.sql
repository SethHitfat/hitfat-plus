-- ═══════════════════════════════════════════════════════════════
--  HITFAT+ · AI COACH
--  Run after 35-plus-sessions.sql. Safe to run again.
--
--  Every HITFAT+ member gets an AI coach (the ai-coach edge function):
--  a 4-week plan generated for them from the filmed library, a weekly
--  review that adjusts the next week, and questions answered with their
--  plan and logs in view.
--
--  plus_coach_plans keeps every plan generated (the latest is the live
--  one), so a plan is the member's even on a new phone, and an admin can
--  see what the coach told them. plus_coach_usage counts calls, so the
--  function can hold each member to a fair number per day and month.
--  Only the edge function (service role) writes either table.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.plus_coach_plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  intake      jsonb not null default '{}'::jsonb,
  plan        jsonb not null,
  version     int not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists plus_coach_plans_user on public.plus_coach_plans (user_id, created_at desc);

alter table public.plus_coach_plans enable row level security;
drop policy if exists plus_coach_plans_read_own on public.plus_coach_plans;
create policy plus_coach_plans_read_own on public.plus_coach_plans
  for select using (auth.uid() = user_id or public.plus_is_admin());

create table if not exists public.plus_coach_usage (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('plan','review','ask')),
  created_at  timestamptz not null default now()
);
create index if not exists plus_coach_usage_user on public.plus_coach_usage (user_id, kind, created_at desc);

alter table public.plus_coach_usage enable row level security;
drop policy if exists plus_coach_usage_read_own on public.plus_coach_usage;
create policy plus_coach_usage_read_own on public.plus_coach_usage
  for select using (auth.uid() = user_id);
