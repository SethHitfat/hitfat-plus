-- 57 · THE START by its name in the sale alert (14 Nov 2026)
-- Seth, after his own test purchase: the phone push said "prog_mula"
-- ("tukar nama the start lah ... the start bukan program mula").
-- plus_sku_label names a SKU in the sale push (52-plus-sale-alert.sql);
-- THE START and AYAH2FIT 30 were missing, so the raw SKU showed.
create or replace function public.plus_sku_label(p text)
returns text language sql immutable as $$
  select case p
    when 'prog_lad4'     then 'MAK2FIT 30'
    when 'prog_mula'     then 'THE START'
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
