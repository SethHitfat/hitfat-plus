-- ═══════════════════════════════════════════════════════════════
-- HITFAT+ · app tables
--
-- RUN THIS IN PROJECT:  khuzvhtctjsnrrovjdye
--   (the same project Hybrid uses, and the one auth.hitfat.io points at)
--
-- These tables reference auth.users, so they must live in the project that
-- issues the logins. That is this one. The food_scans fix is a SEPARATE
-- file, because that table is in a different project entirely.
--
-- Nothing here touches user_data, payments, profiles or events, so Hybrid
-- carries on unchanged.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Where the quota actually lives ─────────────────────────
-- The browser counter is a courtesy display. This table is the truth.
-- Only the edge function (service_role) inserts here; the client can
-- read its own rows and nothing more. No insert/update/delete policy
-- exists for authenticated users, so they cannot forge or erase usage.
create table if not exists public.plus_scans (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Written by the edge function, not generated. A generated column has to be
  -- IMMUTABLE, and every timestamptz-to-month expression in Postgres is only
  -- STABLE because it reads the session time zone. The function computes the
  -- month in UTC and counts it the same way, so insert and count always agree.
  month      text not null,
  kcal       integer,
  food_name  text
);

create index if not exists plus_scans_user_month on public.plus_scans (user_id, month);

alter table public.plus_scans enable row level security;

drop policy if exists plus_scans_read_own on public.plus_scans;
create policy plus_scans_read_own on public.plus_scans
  for select using (auth.uid() = user_id);


-- ── 2. Ownership the client cannot write ──────────────────────
-- There is no subscription. People buy programs, credit packs and passes
-- outright, and each purchase becomes a row here.
--
-- plus_data.data is written by the browser, so anything stored there can be
-- forged. Entitlement has to live somewhere the client can only read. The
-- Bayarcash webhook writes here with the service_role key.
--
--   kind = 'program'  sku = 'prog_<id>'   owned forever, expires_at null
--   kind = 'program'  sku = 'bundle_all'  every program, forever
--   kind = 'credits'  sku = 'scan_c20'    credits_left counts down per scan
--   kind = 'pass'     sku = 'scan_m'      unlimited scans until expires_at
--   kind = 'bar'      sku = 'bar'         owns the physical HITFAT BAR
create table if not exists public.plus_entitlements (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  sku          text not null,
  kind         text not null check (kind in ('program','credits','pass','bar')),
  credits_left integer,
  expires_at   timestamptz,
  source       text,                    -- bayarcash order id, or 'manual'
  created_at   timestamptz not null default now()
);

create index if not exists plus_ent_user on public.plus_entitlements (user_id);

-- One row per one-off product. Credit packs are allowed to repeat, because
-- buying a second pack should add to the balance rather than fail.
create unique index if not exists plus_ent_once
  on public.plus_entitlements (user_id, sku)
  where kind in ('program','bar');

alter table public.plus_entitlements enable row level security;

drop policy if exists plus_ent_read_own on public.plus_entitlements;
create policy plus_ent_read_own on public.plus_entitlements
  for select using (auth.uid() = user_id);
-- Deliberately no insert/update/delete policy. Only service_role writes.


-- ── 3. Payment attempts ───────────────────────────────────────
-- One row per checkout attempt, written before the Bayarcash intent is
-- created, so a callback can never arrive for an order we never made.
-- The buyer may read their own rows; only service_role writes.
create table if not exists public.plus_orders (
  order_number   text primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  sku            text not null,
  amount         numeric(10,2) not null,
  channel        integer,
  status         text not null default 'pending',   -- pending | paid | failed
  transaction_id text,
  note           text,
  created_at     timestamptz not null default now(),
  paid_at        timestamptz
);

create index if not exists plus_orders_user on public.plus_orders (user_id, status);

alter table public.plus_orders enable row level security;

drop policy if exists plus_orders_read_own on public.plus_orders;
create policy plus_orders_read_own on public.plus_orders
  for select using (auth.uid() = user_id);


-- ── 4. The app's own data table ───────────────────────────────
create table if not exists public.plus_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.plus_data enable row level security;

drop policy if exists plus_data_own on public.plus_data;
create policy plus_data_own on public.plus_data
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ── 5. Check your work ────────────────────────────────────────
-- Every one of these must come back with rowsecurity = true.
select tablename, rowsecurity
from   pg_tables
where  schemaname = 'public'
and    tablename in ('plus_scans','plus_entitlements','plus_orders','plus_data')
order  by tablename;
