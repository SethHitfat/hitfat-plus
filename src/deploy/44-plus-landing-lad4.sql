-- 44 · Ladies Burn 30 (prog_lad4) on its own landing page, RM39 (19 Oct 2026)
-- The landing webhook (plus-landing) and this check must list the same SKUs.
create or replace function public.plus_landing_sku(p_sku text)
returns boolean language sql immutable set search_path = public as $$
  select p_sku in ('prog_wl30', 'prog_d6', 'prog_lad4');
$$;
