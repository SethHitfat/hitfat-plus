-- ═══════════════════════════════════════════════════════════════
--  HITFAT+ · DIET 6 MINGGU 6KG sold on its own
--  Run after 33-plus-landing.sql. Safe to run again.
--
--  prog_d6 (RM39) joins prog_wl30 as a program bought on its own landing
--  page: a Bayarcash form's payment, recorded by plus-landing, is claimed
--  by the buyer's email when they sign in (plus_claim_landing).
-- ═══════════════════════════════════════════════════════════════

create or replace function public.plus_landing_sku(p_sku text)
returns boolean language sql immutable as $$
  select p_sku in ('prog_wl30', 'prog_d6');
$$;
