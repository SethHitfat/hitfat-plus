-- ═══════════════════════════════════════════════════════════════
--  HITFAT+ · the membership desk (plus-admin.html)
--  Run after 01-plus-tables.sql and 10-club-tables.sql. Safe to run again.
--
--  What support needs and could only do in the Supabase dashboard:
--    · find a member by email and see their membership and orders
--    · unlock an order that was paid but never granted
--      (the Refund Policy promises exactly this)
--    · give or extend HITFAT+ / HITFAT+ Coach by hand
--    · end a grant made by mistake
--    · delete an account on request (the Privacy Policy promises this),
--      keeping the payment records the law asks us to keep
--
--  Every function here checks, inside the database, that the caller is an
--  admin in club_members. The page hiding a button is a courtesy; this is
--  what says no. Every change leaves a row in plus_admin_log.
-- ═══════════════════════════════════════════════════════════════

-- ── who may ──────────────────────────────────────────────────────
create or replace function public.plus_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.club_members
                 where user_id = auth.uid() and role = 'admin');
$$;

-- ── what happened, and who did it ────────────────────────────────
create table if not exists public.plus_admin_log (
  id         bigint generated always as identity primary key,
  admin_id   uuid,
  action     text not null,
  target     text,
  detail     jsonb,
  created_at timestamptz not null default now()
);
alter table public.plus_admin_log enable row level security;
drop policy if exists plus_admin_log_read on public.plus_admin_log;
create policy plus_admin_log_read on public.plus_admin_log
  for select using (public.plus_is_admin());

-- Payment records outlive a deleted account: plus_orders cascades with the
-- user, so a copy is made here first, with the email the order was for.
create table if not exists public.plus_orders_archive (
  order_number   text primary key,
  user_id        uuid,
  email          text,
  sku            text,
  amount         numeric(10,2),
  channel        integer,
  status         text,
  transaction_id text,
  created_at     timestamptz,
  paid_at        timestamptz,
  archived_at    timestamptz not null default now()
);
alter table public.plus_orders_archive enable row level security;
drop policy if exists plus_orders_archive_read on public.plus_orders_archive;
create policy plus_orders_archive_read on public.plus_orders_archive
  for select using (public.plus_is_admin());

-- ── the membership, as pay-callback grants it ────────────────────
-- Same rule as deploy/_shared/grant.ts: a new period of the same tier
-- starts where the live one ends, so renewing early loses nothing.
create or replace function public.plus_sub_days(p_sku text)
returns int language sql immutable as $$
  select case p_sku
    when 'sub_plus_6m' then 183  when 'sub_plus_12m' then 365
    when 'sub_coach_6m' then 183 when 'sub_coach_12m' then 365
    else null end;
$$;

create or replace function public.plus_grant_sub(p_user uuid, p_sku text, p_source text)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare
  v_days int := public.plus_sub_days(p_sku);
  v_tier text := case when p_sku like 'sub_coach%' then 'sub_coach' else 'sub_plus' end;
  v_from timestamptz;
  v_until timestamptz;
begin
  if v_days is null then raise exception 'Unknown membership %', p_sku; end if;
  select max(expires_at) into v_from from public.plus_entitlements
   where user_id = p_user and sku like v_tier || '%' and expires_at > now();
  v_until := coalesce(v_from, now()) + make_interval(days => v_days);
  insert into public.plus_entitlements (user_id, sku, kind, expires_at, source)
  values (p_user, p_sku, 'pass', v_until, p_source);
  return v_until;
end $$;
revoke all on function public.plus_grant_sub(uuid,text,text) from public, anon, authenticated;

-- ── find ──────────────────────────────────────────────────────────
create or replace function public.plus_admin_find(p_q text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v jsonb;
begin
  if not public.plus_is_admin() then raise exception 'Admins only'; end if;
  if length(trim(coalesce(p_q,''))) < 3 then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(x order by x->>'email'), '[]'::jsonb) into v from (
    select jsonb_build_object(
      'id', u.id, 'email', u.email, 'created_at', u.created_at, 'last_sign_in_at', u.last_sign_in_at,
      'plus_until',  (select max(expires_at) from public.plus_entitlements e
                       where e.user_id = u.id and e.sku like 'sub_plus%'  and e.expires_at > now()),
      'coach_until', (select max(expires_at) from public.plus_entitlements e
                       where e.user_id = u.id and e.sku like 'sub_coach%' and e.expires_at > now()),
      'pending',     (select count(*) from public.plus_orders o where o.user_id = u.id and o.status = 'pending')
    ) x
    from auth.users u
    where u.email ilike '%' || trim(p_q) || '%'
    order by u.email limit 20
  ) t;
  return v;
end $$;

-- ── one member in full ────────────────────────────────────────────
create or replace function public.plus_admin_user(p_user uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.plus_is_admin() then raise exception 'Admins only'; end if;
  return jsonb_build_object(
    'user', (select jsonb_build_object('id',id,'email',email,'created_at',created_at,
                                       'last_sign_in_at',last_sign_in_at)
             from auth.users where id = p_user),
    'staff', (select role from public.club_members where user_id = p_user),
    'entitlements', coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at desc)
                              from public.plus_entitlements e where e.user_id = p_user), '[]'::jsonb),
    'orders', coalesce((select jsonb_agg(to_jsonb(o) order by o.created_at desc)
                        from (select * from public.plus_orders where user_id = p_user
                              order by created_at desc limit 50) o), '[]'::jsonb)
  );
end $$;

-- ── recent orders, for spotting a payment that never unlocked ─────
create or replace function public.plus_admin_recent(p_limit int default 50)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.plus_is_admin() then raise exception 'Admins only'; end if;
  return coalesce((select jsonb_agg(x order by (x->>'created_at') desc) from (
    select to_jsonb(o) || jsonb_build_object('email', u.email) x
    from public.plus_orders o left join auth.users u on u.id = o.user_id
    order by o.created_at desc limit least(greatest(coalesce(p_limit,50),1),200)
  ) t), '[]'::jsonb);
end $$;

-- ── unlock a paid order that did not grant ────────────────────────
-- For a pending order only: the admin has checked the payment with
-- Bayarcash. It grants exactly the SKU that was ordered, as the callback
-- would have, and marks the order paid by hand.
create or replace function public.plus_admin_unlock(p_order text, p_note text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare o public.plus_orders; v_until timestamptz;
begin
  if not public.plus_is_admin() then raise exception 'Admins only'; end if;
  select * into o from public.plus_orders where order_number = p_order for update;
  if not found then raise exception 'No such order'; end if;
  if o.status = 'paid' then raise exception 'That order is already paid'; end if;
  if public.plus_sub_days(o.sku) is null then raise exception 'Only membership orders can be unlocked here'; end if;
  v_until := public.plus_grant_sub(o.user_id, o.sku, o.order_number);
  update public.plus_orders
     set status = 'paid', transaction_id = coalesce(transaction_id,'manual'), paid_at = coalesce(paid_at, now()),
         note = trim(coalesce(note,'') || ' unlocked by admin: ' || coalesce(p_note,''))
   where order_number = p_order;
  insert into public.plus_admin_log (admin_id, action, target, detail)
  values (auth.uid(), 'unlock', p_order, jsonb_build_object('user', o.user_id, 'sku', o.sku, 'until', v_until, 'note', p_note));
  return jsonb_build_object('until', v_until);
end $$;

-- ── give or extend by hand ────────────────────────────────────────
create or replace function public.plus_admin_grant(p_user uuid, p_sku text, p_note text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_until timestamptz;
begin
  if not public.plus_is_admin() then raise exception 'Admins only'; end if;
  if length(trim(coalesce(p_note,''))) < 3 then raise exception 'Say why (a few words)'; end if;
  if not exists (select 1 from auth.users where id = p_user) then raise exception 'No such user'; end if;
  v_until := public.plus_grant_sub(p_user, p_sku, 'admin: ' || trim(p_note));
  insert into public.plus_admin_log (admin_id, action, target, detail)
  values (auth.uid(), 'grant', p_user::text, jsonb_build_object('sku', p_sku, 'until', v_until, 'note', p_note));
  return jsonb_build_object('until', v_until);
end $$;

-- ── end a grant made by mistake ───────────────────────────────────
create or replace function public.plus_admin_end(p_ent bigint, p_note text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e public.plus_entitlements;
begin
  if not public.plus_is_admin() then raise exception 'Admins only'; end if;
  select * into e from public.plus_entitlements where id = p_ent for update;
  if not found then raise exception 'No such entitlement'; end if;
  if e.kind <> 'pass' or e.expires_at is null or e.expires_at <= now() then
    raise exception 'Only a running membership can be ended';
  end if;
  update public.plus_entitlements set expires_at = now() where id = p_ent;
  insert into public.plus_admin_log (admin_id, action, target, detail)
  values (auth.uid(), 'end', p_ent::text, jsonb_build_object('user', e.user_id, 'sku', e.sku, 'was_until', e.expires_at, 'note', p_note));
  return jsonb_build_object('ok', true);
end $$;

-- ── delete an account on request ──────────────────────────────────
-- The email must be typed back as confirmation. Staff accounts and the
-- caller's own account cannot be deleted here. Orders are archived first;
-- everything else that hangs off the user (progress, entitlements, scans,
-- T42 rows) goes with the account through its foreign keys.
create or replace function public.plus_admin_delete(p_user uuid, p_confirm_email text, p_note text)
returns jsonb language plpgsql security definer set search_path = public, auth as $$
declare v_email text; n int;
begin
  if not public.plus_is_admin() then raise exception 'Admins only'; end if;
  select email into v_email from auth.users where id = p_user;
  if v_email is null then raise exception 'No such user'; end if;
  if lower(trim(coalesce(p_confirm_email,''))) <> lower(v_email) then raise exception 'The email typed does not match'; end if;
  if p_user = auth.uid() then raise exception 'You cannot delete your own account here'; end if;
  if exists (select 1 from public.club_members where user_id = p_user and role in ('coach','staff','admin')) then
    raise exception 'Staff accounts cannot be deleted here';
  end if;
  insert into public.plus_orders_archive
    (order_number, user_id, email, sku, amount, channel, status, transaction_id, created_at, paid_at)
  select order_number, user_id, v_email, sku, amount, channel, status, transaction_id, created_at, paid_at
    from public.plus_orders where user_id = p_user
  on conflict (order_number) do nothing;
  get diagnostics n = row_count;
  delete from auth.users where id = p_user;
  insert into public.plus_admin_log (admin_id, action, target, detail)
  values (auth.uid(), 'delete', p_user::text, jsonb_build_object('email', v_email, 'orders_archived', n, 'note', p_note));
  return jsonb_build_object('ok', true, 'orders_archived', n);
end $$;

-- ── the log ───────────────────────────────────────────────────────
create or replace function public.plus_admin_log_recent(p_limit int default 50)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.plus_is_admin() then raise exception 'Admins only'; end if;
  return coalesce((select jsonb_agg(x order by (x->>'created_at') desc) from (
    select to_jsonb(l) || jsonb_build_object('admin_email', u.email) x
    from public.plus_admin_log l left join auth.users u on u.id = l.admin_id
    order by l.created_at desc limit least(greatest(coalesce(p_limit,50),1),200)
  ) t), '[]'::jsonb);
end $$;

-- Signed-in users may call the admin functions; each one refuses anyone
-- who is not an admin. Nobody anonymous may call them at all.
revoke all on function public.plus_admin_find(text)                  from public, anon;
revoke all on function public.plus_admin_user(uuid)                  from public, anon;
revoke all on function public.plus_admin_recent(int)                 from public, anon;
revoke all on function public.plus_admin_unlock(text,text)           from public, anon;
revoke all on function public.plus_admin_grant(uuid,text,text)       from public, anon;
revoke all on function public.plus_admin_end(bigint,text)            from public, anon;
revoke all on function public.plus_admin_delete(uuid,text,text)      from public, anon;
revoke all on function public.plus_admin_log_recent(int)             from public, anon;
grant execute on function public.plus_admin_find(text)               to authenticated;
grant execute on function public.plus_admin_user(uuid)               to authenticated;
grant execute on function public.plus_admin_recent(int)              to authenticated;
grant execute on function public.plus_admin_unlock(text,text)        to authenticated;
grant execute on function public.plus_admin_grant(uuid,text,text)    to authenticated;
grant execute on function public.plus_admin_end(bigint,text)         to authenticated;
grant execute on function public.plus_admin_delete(uuid,text,text)   to authenticated;
grant execute on function public.plus_admin_log_recent(int)          to authenticated;
