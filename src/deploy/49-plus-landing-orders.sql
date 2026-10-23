-- ═══════════════════════════════════════════════════════════════
--  HITFAT+ · PROGRAMS PAID ON A LANDING PAGE, THROUGH BAYARCASH ITSELF
--  Run after 44-plus-landing-lad4.sql. Safe to run again.
--
--  (24 Oct 2026, Seth: pay straight on the landing page, on Bayarcash, not
--  a Bayarcash Link form.) The landing page asks for name, email and phone
--  and the landing-pay function opens a Bayarcash payment intent, as
--  pay-create does in the app, but for a buyer with no account yet. The
--  order is kept here while it is open; once Bayarcash says it is paid
--  (its signed callback, or the berjaya page asking) it becomes a row of
--  plus_landing_purchases, and the existing claim (by order number or by
--  email, plus_claim_landing) opens the program on her account.
--
--  A pending order is never claimable: plus_landing_purchases only ever
--  holds what was paid.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.plus_landing_orders (
  order_number    text primary key,              -- 'HL…', made by landing-pay
  sku             text not null,
  email           text not null,
  name            text,
  phone           text,
  amount          numeric(10,2) not null,
  channel         int,
  status          text not null default 'pending' check (status in ('pending','paid','failed')),
  transaction_id  text,
  note            text,
  created_at      timestamptz not null default now(),
  paid_at         timestamptz
);
create index if not exists plus_landing_orders_email on public.plus_landing_orders (lower(email));

-- Only the service role (landing-pay) writes; admins can read it on the desk.
alter table public.plus_landing_orders enable row level security;
drop policy if exists plus_landing_orders_admin on public.plus_landing_orders;
create policy plus_landing_orders_admin on public.plus_landing_orders
  for select using (public.plus_is_admin());
