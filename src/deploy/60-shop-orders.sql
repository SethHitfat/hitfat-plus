-- ═══════════════════════════════════════════════════════════════
--  HITFAT · SHOP ORDERS (HITFAT Performance tee, app.hitfat.io/shop)
--  Safe to run again.
--
--  (26 Nov 2026, Seth: sell the tee, RM69 each, RM59 each from 3, paid on
--  Bayarcash with FPX or DuitNow QR.) shop-pay writes here with the service
--  role; the price is worked out there, never sent by the page. Admins read.
--  fulfil: what the gym has done with a paid order (new → siap → diambil/dihantar).
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.shop_orders (
  order_number    text primary key,              -- 'HS…', made by shop-pay
  email           text not null,
  name            text,
  phone           text,
  items           jsonb not null,                -- [{c, s, q, warna}]
  qty             int not null check (qty between 1 and 30),
  unit_price      numeric(10,2) not null,
  delivery        text not null default 'ambil',
  delivery_fee    numeric(10,2) not null default 0,
  address         jsonb,                         -- {line, poskod, bandar, negeri} when posted
  amount          numeric(10,2) not null,
  channel         int,
  status          text not null default 'pending' check (status in ('pending','paid','failed')),
  fulfil          text not null default 'new' check (fulfil in ('new','siap','diambil','dihantar')),
  transaction_id  text,
  note            text,
  meta            jsonb,
  created_at      timestamptz not null default now(),
  paid_at         timestamptz
);
create index if not exists shop_orders_paid on public.shop_orders (paid_at desc) where status = 'paid';

alter table public.shop_orders enable row level security;
drop policy if exists shop_orders_admin on public.shop_orders;
create policy shop_orders_admin on public.shop_orders
  for select using (public.plus_is_admin());

select 'shop orders ready' as status;
