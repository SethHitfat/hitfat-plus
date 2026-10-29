-- ═══════════════════════════════════════════════════════════════
-- HITFAT+ · a push on Seth's phone for every sale (30 Oct 2026)
--
-- Seth: "aku nak dia keluar notification dekat phone aku. Macam style
-- notification WhatsApp". Every paid sale, from a landing page or inside
-- the app, sends a Web Push to the people listed in plus_sale_alert_to,
-- through plus-push ?action=notify (the same door plus-class uses), so it
-- lands on the lock screen like a message: "💰 Jualan baru! RM39" /
-- "MAK2FIT 30 · Salwani · landing page".
--
--   plus_landing_purchases  insert, source 'landing' (landing-pay, plus-landing);
--                           a 'manual' grant is not a sale and stays quiet
--   plus_orders             status turning 'paid' (pay-callback, pay-status)
--
-- The call goes out with pg_net after the payment's own transaction has
-- committed, and any failure only warns: an alert can never stop a sale
-- from being recorded. Only the buyer's first name travels.
--
-- Who hears: plus_sale_alert_to (service role only). Seth's HITFAT+
-- account to start; add a row for anyone else (plus-push sends to 5 at most).
-- Idempotent.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.plus_sale_alert_to (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  note       text,
  created_at timestamptz not null default now()
);
alter table public.plus_sale_alert_to enable row level security;
revoke all on public.plus_sale_alert_to from anon, authenticated;

insert into public.plus_sale_alert_to(user_id, note)
values ('32e918de-e724-4bf7-872f-ed2bfca90c8a', 'Seth (sethnasser1991)')
on conflict (user_id) do nothing;

/* the names the OS report uses */
create or replace function public.plus_sku_label(p text)
returns text language sql immutable as $$
  select case p
    when 'prog_lad4'     then 'MAK2FIT 30'
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

create or replace function public.plus_sale_alert_send(p_sku text, p_amount numeric, p_who text, p_via text, p_order text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  k  text;
  u  jsonb;
  rm text;
begin
  select value into k from plus_settings where key = 'push_cron_key';
  select coalesce(jsonb_agg(user_id::text), '[]'::jsonb) into u from plus_sale_alert_to;
  if k is null or jsonb_array_length(u) = 0 then return; end if;
  rm := case when p_amount = trunc(p_amount) then to_char(p_amount, 'FM999990') else to_char(p_amount, 'FM999990.00') end;
  perform net.http_post(
    url     := 'https://ercvaagznsndvrewlvgt.supabase.co/functions/v1/plus-push?action=notify&key=' || k,
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body    := jsonb_build_object(
                 'users', u,
                 'title', '💰 Jualan baru! RM' || coalesce(rm, '?'),
                 'body',  plus_sku_label(p_sku) || coalesce(' · ' || nullif(btrim(p_who), ''), '') || ' · ' || p_via,
                 'url',   '/os',
                 'tag',   'sale-' || coalesce(p_order, gen_random_uuid()::text)),
    timeout_milliseconds := 10000);
exception when others then
  raise warning 'plus sale alert failed: %', sqlerrm;
end
$$;
revoke all on function public.plus_sale_alert_send(text, numeric, text, text, text) from public, anon, authenticated;

/* a landing page sale: the purchase row */
create or replace function public.plus_sale_alert_landing()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.source = 'landing' then
    perform plus_sale_alert_send(new.sku, new.amount, split_part(coalesce(new.name, ''), ' ', 1), 'landing page', new.order_number);
  end if;
  return new;
end
$$;
drop trigger if exists plus_sale_alert on public.plus_landing_purchases;
create trigger plus_sale_alert after insert on public.plus_landing_purchases
  for each row execute function public.plus_sale_alert_landing();

/* an in-app sale: the order turning paid, once */
create or replace function public.plus_sale_alert_app()
returns trigger language plpgsql security definer set search_path = public as $$
declare who text;
begin
  if new.status = 'paid' and old.status is distinct from 'paid' then
    select split_part(coalesce(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', ''), ' ', 1)
      into who from auth.users where id = new.user_id;
    perform plus_sale_alert_send(new.sku, new.amount, who, 'dalam app', new.order_number);
  end if;
  return new;
end
$$;
drop trigger if exists plus_sale_alert on public.plus_orders;
create trigger plus_sale_alert after update of status on public.plus_orders
  for each row execute function public.plus_sale_alert_app();

select 'sale alert ready' as status, (select count(*) from plus_sale_alert_to) as listeners;
