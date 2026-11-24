-- 59 · HITFAT SYNC 30 sold on its own page (24 Nov 2026)
-- Seth: SYNC is sold like MAK2FIT and THE START, on app.hitfat.io/sync,
-- RM59 one-time ("buat semua ni"). landing-pay takes the order; these two
-- name it as a program sold on its own, and by its name in the sale push.
-- Both are copied from the live definitions of 24 Nov 2026 with one entry
-- added. No affiliate rate: SYNC pays no commission until Seth chooses one.
create or replace function public.plus_landing_sku(p_sku text)
returns boolean language sql immutable set search_path = public as $$
  select p_sku in ('prog_wl30', 'prog_d6', 'prog_lad4', 'prog_mula', 'prog_sync30');
$$;

create or replace function public.plus_sku_label(p text)
returns text language sql immutable as $$
  select case p
    when 'prog_lad4'     then 'MAK2FIT 30'
    when 'prog_mula'     then 'THE START'
    when 'prog_sync30'   then 'HITFAT SYNC 30'
    when 'prog_ay30'     then 'AYAH2FIT 30'
    when 'prog_wl30'     then 'BURN30'
    when 'prog_d6'       then 'DIET 6 MINGGU 6KG'
    when 'bundle_all'    then 'All programs bundle'
    when 'sub_plus_6m'   then 'HITFAT+ 6 bulan'
    when 'sub_plus_12m'  then 'HITFAT+ 12 bulan'
    when 'sub_coach_6m'  then 'HITFAT+ Coach 6 bulan'
    when 'sub_coach_12m' then 'HITFAT+ Coach 12 bulan'
    when 'scan_d3'       then 'Meal Scan 3/hari'
    when 'scan_d6'       then 'Meal Scan 6/hari'
    when 'scan_dx'       then 'Meal Scan Unlimited'
    else p end
$$;
