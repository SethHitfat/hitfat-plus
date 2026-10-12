-- ═══════════════════════════════════════════════════════════════
--  HITFAT+ · PROGRAMS PAID ON A LANDING PAGE
--  Run after 32-plus-admin.sql. Safe to run again.
--
--  A program sold on its own (the 30-Day Weight Loss, prog_wl30, RM39) is
--  bought on its landing page — a Bayarcash Link form — as well as in the
--  app. When the form's payment succeeds, its webhook calls the
--  plus-landing edge function, which records the purchase here against the
--  buyer's email. When that person signs in to HITFAT+ with the same
--  email, the app calls plus_claim_landing() and the purchase becomes a
--  plus_entitlements row on their account — theirs for good.
--
--  Someone who paid with a different email claims with the order number
--  from their receipt. Admins can record a payment taken another way, give
--  a program by hand, and read the webhook address, on plus-admin.html.
-- ═══════════════════════════════════════════════════════════════

do $order$
begin
  if to_regprocedure('public.plus_is_admin()') is null then
    raise exception 'Run 32-plus-admin.sql first.';
  end if;
end
$order$;

create extension if not exists pgcrypto;

-- The programs that are sold on their own. A webhook for anything else is
-- refused, so a form pointed at the wrong address cannot hand out the
-- membership.
create or replace function public.plus_landing_sku(p_sku text)
returns boolean language sql immutable as $$
  select p_sku in ('prog_wl30');
$$;

create table if not exists public.plus_landing_purchases (
  id            uuid primary key default gen_random_uuid(),
  sku           text not null,
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
create index if not exists plus_landing_email on public.plus_landing_purchases (lower(email));

-- Buyers go through the functions below; admins read it on the desk. Only
-- the service role (the webhook) writes, besides the admin function.
alter table public.plus_landing_purchases enable row level security;
drop policy if exists plus_landing_admin on public.plus_landing_purchases;
create policy plus_landing_admin on public.plus_landing_purchases
  for select using (public.plus_is_admin());

-- The webhook's shared secret, readable only by the service role and, for
-- copying into the form, by an admin through plus_admin_landing_hook().
create table if not exists public.plus_settings (
  key   text primary key,
  value text not null
);
alter table public.plus_settings enable row level security;
insert into public.plus_settings (key, value)
values ('landing_webhook_key', encode(gen_random_bytes(24), 'hex'))
on conflict (key) do nothing;

-- A program on an account, once. The unique index on (user_id, sku) for
-- programs makes a second grant a no-op rather than an error.
create or replace function public.plus_grant_program(p_user uuid, p_sku text, p_source text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_sku not like 'prog\_%' then raise exception 'Not a program: %', p_sku; end if;
  insert into public.plus_entitlements (user_id, sku, kind, source)
  values (p_user, p_sku, 'program', p_source)
  on conflict (user_id, sku) where kind in ('program','bar') do nothing;
  return found;
end $$;
revoke all on function public.plus_grant_program(uuid,text,text) from public, anon, authenticated;

-- ── the buyer ─────────────────────────────────────────────────────
-- Everything bought under my email and not yet claimed, or the one order
-- I typed in, becomes mine. Returns the programs it opened.
create or replace function public.plus_claim_landing(p_order text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_email text;
  v_got   text[] := '{}';
  r       public.plus_landing_purchases;
begin
  if auth.uid() is null then
    raise exception 'Sign in first' using errcode = 'insufficient_privilege';
  end if;
  select lower(email) into v_email from auth.users where id = auth.uid();

  for r in
    select * from public.plus_landing_purchases p
     where p.claimed_by is null
       and case when p_order is not null and length(trim(p_order)) > 0
                then upper(p.order_number) = upper(trim(p_order))
                else lower(p.email) = v_email end
     for update
  loop
    perform public.plus_grant_program(auth.uid(), r.sku, 'landing:' || coalesce(r.order_number, r.id::text));
    update public.plus_landing_purchases set claimed_by = auth.uid(), claimed_at = now() where id = r.id;
    v_got := v_got || r.sku;
  end loop;
  return jsonb_build_object('claimed', to_jsonb(v_got));
end $$;
revoke all    on function public.plus_claim_landing(text) from public, anon;
grant execute on function public.plus_claim_landing(text) to authenticated;

-- ── the admin desk ────────────────────────────────────────────────
create or replace function public.plus_admin_landing_recent(p_limit int default 100)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.plus_is_admin() then raise exception 'Admins only'; end if;
  select coalesce(jsonb_agg(x order by x->>'paid_at' desc), '[]'::jsonb) into v from (
    select jsonb_build_object('id', p.id, 'sku', p.sku, 'email', p.email, 'name', p.name, 'phone', p.phone,
             'order_number', p.order_number, 'amount', p.amount, 'source', p.source, 'paid_at', p.paid_at,
             'claimed_at', p.claimed_at, 'claimed_email', u.email) x
      from public.plus_landing_purchases p
      left join auth.users u on u.id = p.claimed_by
     order by p.paid_at desc
     limit greatest(1, least(coalesce(p_limit,100), 500))
  ) t;
  return v;
end $$;

-- A payment taken outside the form (bank transfer, cash): recorded as if the
-- form had sent it, so it opens on the buyer's next sign-in.
create or replace function public.plus_admin_landing_add(p_email text, p_sku text, p_note text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_order text := 'MANUAL-' || upper(encode(gen_random_bytes(5), 'hex'));
begin
  if not public.plus_is_admin() then raise exception 'Admins only'; end if;
  if not public.plus_landing_sku(p_sku) then raise exception 'Not a program sold on its own'; end if;
  if position('@' in coalesce(p_email,'')) < 2 then raise exception 'Enter the buyer''s email'; end if;
  if length(trim(coalesce(p_note,''))) < 3 then raise exception 'Say why (a few words)'; end if;
  insert into public.plus_landing_purchases (sku, email, order_number, source, raw)
  values (p_sku, lower(trim(p_email)), v_order, 'manual', jsonb_build_object('note', p_note, 'by', auth.uid()));
  insert into public.plus_admin_log (admin_id, action, target, detail)
  values (auth.uid(), 'landing_add', lower(trim(p_email)), jsonb_build_object('sku', p_sku, 'order', v_order, 'note', p_note));
  return jsonb_build_object('order_number', v_order);
end $$;

-- The address to paste into the Bayarcash form's webhook setting.
create or replace function public.plus_admin_landing_hook()
returns text language plpgsql stable security definer set search_path = public as $$
begin
  if not public.plus_is_admin() then raise exception 'Admins only'; end if;
  return (select value from public.plus_settings where key = 'landing_webhook_key');
end $$;

-- Give: a membership as before, or now a program on its own.
create or replace function public.plus_admin_grant(p_user uuid, p_sku text, p_note text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_until timestamptz;
begin
  if not public.plus_is_admin() then raise exception 'Admins only'; end if;
  if length(trim(coalesce(p_note,''))) < 3 then raise exception 'Say why (a few words)'; end if;
  if not exists (select 1 from auth.users where id = p_user) then raise exception 'No such user'; end if;
  if public.plus_landing_sku(p_sku) then
    perform public.plus_grant_program(p_user, p_sku, 'admin: ' || trim(p_note));
  else
    v_until := public.plus_grant_sub(p_user, p_sku, 'admin: ' || trim(p_note));
  end if;
  insert into public.plus_admin_log (admin_id, action, target, detail)
  values (auth.uid(), 'grant', p_user::text, jsonb_build_object('sku', p_sku, 'until', v_until, 'note', p_note));
  return jsonb_build_object('until', v_until);
end $$;

-- Unlock: a pending in-app order for a membership as before, or a program.
create or replace function public.plus_admin_unlock(p_order text, p_note text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare o public.plus_orders; v_until timestamptz;
begin
  if not public.plus_is_admin() then raise exception 'Admins only'; end if;
  select * into o from public.plus_orders where order_number = p_order for update;
  if not found then raise exception 'No such order'; end if;
  if o.status = 'paid' then raise exception 'That order is already paid'; end if;
  if public.plus_landing_sku(o.sku) then
    perform public.plus_grant_program(o.user_id, o.sku, o.order_number);
  elsif public.plus_sub_days(o.sku) is null then
    raise exception 'Only membership and program orders can be unlocked here';
  else
    v_until := public.plus_grant_sub(o.user_id, o.sku, o.order_number);
  end if;
  update public.plus_orders
     set status = 'paid', transaction_id = coalesce(transaction_id,'manual'), paid_at = coalesce(paid_at, now()),
         note = trim(coalesce(note,'') || ' unlocked by admin: ' || coalesce(p_note,''))
   where order_number = p_order;
  insert into public.plus_admin_log (admin_id, action, target, detail)
  values (auth.uid(), 'unlock', p_order, jsonb_build_object('user', o.user_id, 'sku', o.sku, 'until', v_until, 'note', p_note));
  return jsonb_build_object('until', v_until);
end $$;

revoke all on function public.plus_admin_landing_recent(int)          from public, anon;
revoke all on function public.plus_admin_landing_add(text,text,text)  from public, anon;
revoke all on function public.plus_admin_landing_hook()               from public, anon;
revoke all on function public.plus_admin_grant(uuid,text,text)        from public, anon;
revoke all on function public.plus_admin_unlock(text,text)            from public, anon;
grant execute on function public.plus_admin_landing_recent(int)         to authenticated;
grant execute on function public.plus_admin_landing_add(text,text,text) to authenticated;
grant execute on function public.plus_admin_landing_hook()              to authenticated;
grant execute on function public.plus_admin_grant(uuid,text,text)       to authenticated;
grant execute on function public.plus_admin_unlock(text,text)           to authenticated;
