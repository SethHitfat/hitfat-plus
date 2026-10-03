-- ═══════════════════════════════════════════════════════════════
--  T42 · PAID ON THE LANDING PAGE
--  Run after 28-coach-t42.sql. Safe to run again.
--
--  T42 is sold on its landing page (a Bayarcash Link form on
--  hitfat.bcl.my), not inside the app. When a payment succeeds, the form's
--  webhook calls the t42-purchase edge function, which records the
--  purchase here against the buyer's email. When that person signs in to
--  the app with the same email, they set up their place — track and
--  baseline — and the registration is confirmed against the purchase. No
--  price, no checkout in the app.
--
--  Someone who paid with a different email claims by order number. Staff
--  can record a purchase by hand (bank transfer, cash at HQ).
-- ═══════════════════════════════════════════════════════════════

do $order$
begin
  if to_regprocedure('public.t42_is_paid_status(text)') is null then
    raise exception 'Run 20- to 28-*.sql first.';
  end if;
end
$order$;

create extension if not exists pgcrypto;

create table if not exists public.t42_purchases (
  id            uuid primary key default gen_random_uuid(),
  challenge_id  uuid not null references public.t42_challenges(id) on delete cascade,
  email         text not null,
  name          text,
  phone         text,
  order_number  text unique,                 -- Bayarcash order, or 'MANUAL-…'
  amount        numeric(10,2),
  source        text not null default 'landing' check (source in ('landing','manual')),
  paid_at       timestamptz not null default now(),
  claimed_by    uuid references auth.users(id) on delete set null,
  claimed_at    timestamptz,
  raw           jsonb,                        -- the webhook as received, for support
  created_at    timestamptz not null default now()
);
create index if not exists t42_purchases_email on public.t42_purchases (lower(email));
create index if not exists t42_purchases_challenge on public.t42_purchases (challenge_id);

-- Nobody reads this table directly from the app: buyers go through the
-- functions below, staff through the admin desk. Only the service role
-- (the webhook) writes, besides the staff function.
alter table public.t42_purchases enable row level security;
drop policy if exists t42_purchases_staff on public.t42_purchases;
create policy t42_purchases_staff on public.t42_purchases
  for select using (public.t42_is_staff());

-- The webhook's shared secret, readable only by the service role. Created
-- once, random; the webhook URL carries it as ?key=.
create table if not exists public.t42_settings (
  key   text primary key,
  value text not null
);
alter table public.t42_settings enable row level security;
insert into public.t42_settings (key, value)
values ('purchase_webhook_key', encode(gen_random_bytes(24), 'hex'))
on conflict (key) do nothing;

-- My email, from the signed-in session.
create or replace function public.t42_my_email()
returns text language sql stable security definer set search_path = public as $$
  select lower(email) from auth.users where id = auth.uid();
$$;
revoke all on function public.t42_my_email() from public, anon, authenticated;

-- Has this account paid for this edition? (By email, or a purchase it has
-- already claimed.) What the app asks before showing "Join" or "Set up".
create or replace function public.t42_my_purchase(p_challenge uuid)
returns table (paid boolean, order_number text, paid_at timestamptz)
language sql stable security definer set search_path = public as $$
  select true, p.order_number, p.paid_at
    from public.t42_purchases p
   where p.challenge_id = p_challenge
     and (p.claimed_by = auth.uid()
          or (p.claimed_by is null and lower(p.email) = public.t42_my_email()))
   order by p.paid_at desc
   limit 1;
$$;
revoke all    on function public.t42_my_purchase(uuid) from public, anon;
grant execute on function public.t42_my_purchase(uuid) to authenticated;

-- Confirm my pending registration against a purchase: my email's, or the
-- order number I typed. A purchase confirms one registration, once.
create or replace function public.t42_claim_purchase(p_challenge uuid, p_order text default null)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_reg public.t42_registrations%rowtype;
  v_pur public.t42_purchases%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sign in first' using errcode = 'insufficient_privilege';
  end if;

  select * into v_reg from public.t42_registrations
   where challenge_id = p_challenge and user_id = auth.uid();
  if not found then
    raise exception 'Finish setting up your T42 first' using errcode = 'check_violation';
  end if;
  if public.t42_is_paid_status(v_reg.status) then return 'already'; end if;
  if v_reg.status <> 'pending' then
    raise exception 'This place cannot be confirmed' using errcode = 'check_violation';
  end if;

  if p_order is not null and length(trim(p_order)) > 0 then
    select * into v_pur from public.t42_purchases
     where challenge_id = p_challenge and upper(order_number) = upper(trim(p_order))
       and (claimed_by is null or claimed_by = auth.uid())
     limit 1;
  else
    select * into v_pur from public.t42_purchases
     where challenge_id = p_challenge
       and (claimed_by = auth.uid()
            or (claimed_by is null and lower(email) = public.t42_my_email()))
     order by paid_at desc limit 1;
  end if;
  if not found then
    raise exception 'No T42 payment found for this account yet' using errcode = 'check_violation';
  end if;

  update public.t42_purchases set claimed_by = auth.uid(), claimed_at = now() where id = v_pur.id;
  update public.t42_registrations set status = 'paid', product_sku = 'landing' where id = v_reg.id;
  return 'claimed';
end $$;
revoke all    on function public.t42_claim_purchase(uuid, text) from public, anon;
grant execute on function public.t42_claim_purchase(uuid, text) to authenticated;

-- Staff record a payment taken outside the form.
create or replace function public.t42_add_purchase(p_challenge uuid, p_email text, p_name text default null,
                                                   p_note text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not public.t42_is_staff() then
    raise exception 'Staff only' using errcode = 'insufficient_privilege';
  end if;
  if p_email is null or position('@' in p_email) = 0 then
    raise exception 'A valid email is needed' using errcode = 'check_violation';
  end if;
  insert into public.t42_purchases (challenge_id, email, name, order_number, source, raw)
  values (p_challenge, lower(trim(p_email)), p_name,
          -- md5(random()), not gen_random_bytes: pgcrypto lives in the extensions
          -- schema on Supabase, outside this function's search_path.
          'MANUAL-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)), 'manual',
          jsonb_build_object('note', p_note, 'by', auth.uid()))
  returning id into v_id;
  insert into public.t42_admin_notes (challenge_id, action, detail, acted_by)
  values (p_challenge, 'add_purchase', lower(trim(p_email)) || coalesce(' · ' || p_note, ''), auth.uid());
  return v_id;
end $$;
revoke all    on function public.t42_add_purchase(uuid, text, text, text) from public, anon;
grant execute on function public.t42_add_purchase(uuid, text, text, text) to authenticated;
