-- ═══════════════════════════════════════════════════════════════
--  THE START on its own landing page (11 Nov 2026, Seth: "landimg page",
--  RM49, affiliates "RM10 macam MAK2FIT").
--
--  1. An affiliate's sale of THE START earns RM10, as MAK2FIT 30 does.
--  2. prog_mula is a program sold on its own, for the old webhook's list
--     too (plus-landing), so the two lists agree.
--  Nothing else changes: landing-pay records the order and the purchase,
--  and plus_claim_landing() opens it on the buyer's account, for any SKU.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.plus_affiliate_rate(p_sku text)
returns numeric language sql immutable as $$
  select case p_sku
    when 'prog_lad4'    then 10
    when 'prog_mula'    then 10
    when 'sub_plus_6m'  then 30
    when 'sub_plus_12m' then 40
    else 0 end::numeric;
$$;

create or replace function public.plus_landing_sku(p_sku text)
returns boolean language sql immutable set search_path to 'public' as $$
  select p_sku in ('prog_wl30', 'prog_d6', 'prog_lad4', 'prog_mula');
$$;
