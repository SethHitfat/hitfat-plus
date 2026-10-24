-- ═══════════════════════════════════════════════════════════════
--  HITFAT+ · META CONVERSIONS API FOR LANDING-PAGE ORDERS
--  Run after 49-plus-landing-orders.sql. Safe to run again.
--
--  (24 Oct 2026, Seth: "ok teruskan" CAPI.) Once Bayarcash confirms a
--  landing-page order, landing-pay tells Meta of the Purchase from the
--  server as well as the browser, under the same event id (lad4-<order>),
--  so Meta counts it once. To match it to the ad, Meta needs what the
--  browser had when she pressed Bayar: the _fbp/_fbc cookies, her IP and
--  browser. They are kept with the order here. Email and phone are sent
--  hashed (SHA-256), never as they are.
-- ═══════════════════════════════════════════════════════════════

alter table public.plus_landing_orders add column if not exists meta jsonb;       -- {fbp, fbc, ip, ua}
alter table public.plus_landing_orders add column if not exists capi_sent_at timestamptz;
