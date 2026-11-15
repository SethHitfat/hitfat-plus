-- ═══════════════════════════════════════════════════════════════
-- HITFAT+ · phone push for sales that land in HITFAT OS (15 Nov 2026)
--
-- Seth: "Kalau orang beli, kira keluar notification juga" (HITFAT Junior,
-- hitfat.io/kids), then "ya". Junior, T42 and the other apps record paid
-- sales in HITFAT OS (app_sales). OS sql/117 sends each NEW sale here, and
-- this pushes it to the people in plus_sale_alert_to through plus-push
-- ?action=notify, in the HITFAT OS look: "💰 HITFAT OS · Jualan baru! RM35" /
-- "HITFAT Junior · Aminah · hitfat.io/kids", with the OS mark as the picture
-- (plus-push accepts icon since 15 Nov). Tapping it opens OS (HITFAT+).
--
-- The caller proves itself with the OS report key that os_report already
-- checks (os_report_key holds only its sha256), so no new secret is made.
-- Only the payer's first name travels. Idempotent.
-- ═══════════════════════════════════════════════════════════════

create or replace function public.os_sale_alert(p_key text, p_app text, p_amount numeric, p_who text, p_order text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  k  text;
  u  jsonb;
  rm text;
  v_label text;
  v_via   text;
  v_who   text := nullif(btrim(split_part(left(coalesce(p_who, ''), 60), ' ', 1)), '');
begin
  if not exists (
    select 1 from os_report_key
     where key_hash = encode(sha256(convert_to(coalesce(p_key, ''), 'UTF8')), 'hex')
  ) then
    return 'not_allowed';
  end if;

  select value into k from plus_settings where key = 'push_cron_key';
  select coalesce(jsonb_agg(user_id::text), '[]'::jsonb) into u from plus_sale_alert_to;
  if k is null or jsonb_array_length(u) = 0 then return 'no_listener'; end if;

  v_label := case p_app
    when 'junior' then 'HITFAT Junior'
    when 't42'    then 'T42 Physical'
    when 'mon'    then 'HitFatMON'
    when 'hybrid' then 'HITFAT HYBRID'
    when 'pkr'    then 'Pantai Kita Run'
    else coalesce(nullif(left(btrim(p_app), 30), ''), 'Jualan app') end;
  v_via := case p_app when 'junior' then 'hitfat.io/kids' else null end;
  rm := case when coalesce(p_amount, 0) = trunc(coalesce(p_amount, 0)) then to_char(coalesce(p_amount, 0), 'FM999990')
             else to_char(p_amount, 'FM999990.00') end;

  /* HITFAT OS look (Seth, 15 Nov: "gambar effect OS, jangan effect plus"): OS mark as the
     picture (Android, desktop; an iPhone always shows the app icon) and "HITFAT OS" in the title */
  perform net.http_post(
    url     := 'https://ercvaagznsndvrewlvgt.supabase.co/functions/v1/plus-push?action=notify&key=' || k,
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body    := jsonb_build_object(
                 'users', u,
                 'title', '💰 HITFAT OS · Jualan baru! RM' || rm,
                 'body',  v_label || coalesce(' · ' || v_who, '') || coalesce(' · ' || v_via, ''),
                 'url',   '/os',
                 'icon',  '/img/mascot/push/os.png',
                 'tag',   'os-sale-' || left(coalesce(p_order, gen_random_uuid()::text), 60)),
    timeout_milliseconds := 10000);
  return 'ok';
exception when others then
  raise warning 'os sale alert failed: %', sqlerrm;
  return 'failed';
end
$$;

revoke all on function public.os_sale_alert(text, text, numeric, text, text) from public;
grant execute on function public.os_sale_alert(text, text, numeric, text, text) to anon, authenticated;

select 'os sale alert ready' as status;
