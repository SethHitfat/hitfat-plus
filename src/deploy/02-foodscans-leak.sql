-- ═══════════════════════════════════════════════════════════════
-- HITFAT+ · close the food_scans leak
--
-- RUN THIS IN PROJECT:  lknsvzvggfqmysiaffgd
--   (the old meal-tracker project — NOT the one the app logs in against)
--
-- food_scans currently has RLS off, so anyone holding that project's anon
-- key can read every row. This is the only statement that belongs in that
-- project; everything else HITFAT+ needs lives in khuzvhtctjsnrrovjdye.
-- ═══════════════════════════════════════════════════════════════

alter table public.food_scans enable row level security;

-- Owners read their own rows. Nothing else is granted, so the anon key
-- returns zero rows instead of the whole table.
drop policy if exists food_scans_own on public.food_scans;
create policy food_scans_own on public.food_scans
  for select using (auth.uid() = user_id);

-- Must come back true.
select tablename, rowsecurity
from   pg_tables
where  schemaname = 'public' and tablename = 'food_scans';
