-- Typed meals (20 Oct 2026): every "type what you ate" estimate, counted for
-- the daily allowance in scan-food (30 with a live pass, 5 without). Only the
-- service role reads or writes it; members never see the table.
create table if not exists public.plus_text_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  text       text not null,
  kcal       integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists plus_text_logs_user_day on public.plus_text_logs (user_id, created_at desc);
alter table public.plus_text_logs enable row level security;
-- no policies: closed to anon and authenticated; the edge function uses the service role
