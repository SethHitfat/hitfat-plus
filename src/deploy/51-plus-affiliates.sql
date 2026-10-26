-- ═══════════════════════════════════════════════════════════════
--  HITFAT+ · AFFILIATES: members and agents who sell, for a commission
--  Run after 49-plus-landing-orders.sql and 32-plus-admin.sql. Safe to run again.
--
--  (26 Oct 2026, Seth: "boleh buat affiliate untuk orang ke agen ke klien,
--  dia boleh commission".) Decisions, Seth's:
--    · who: members (HITFAT+ or class) and agents, approved by an admin first
--    · commission: MAK2FIT 30 RM10 · HITFAT+ 6 months RM30 · 12 months RM40
--    · paid: cash once a month, or OS points for class members
--    · the buyer pays the same price; there is no discount code
--
--  How it runs: an affiliate's link carries ?ref=CODE; the landing page and
--  the app keep it 30 days and send it with the order (plus_landing_orders.ref,
--  plus_orders.ref). When Bayarcash says the order is paid, landing-pay or
--  grant() calls plus_commission_record once; the order number is unique,
--  so a retried callback records nothing twice. Payouts are by hand
--  (Bayarcash cannot split a payment): the desk marks them paid.
--
--  Every rule lives here, not in the page: a code must be approved, an
--  affiliate cannot earn on their own purchase, and only the service role
--  (the payment functions) can record a commission.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.plus_affiliates (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid unique references auth.users(id) on delete set null,
  code         text not null unique check (code ~ '^[A-Z0-9]{3,16}$'),
  name         text not null,
  phone        text,
  email        text,
  kind         text not null default 'member' check (kind in ('member','agent')),
  status       text not null default 'pending' check (status in ('pending','approved','paused')),
  payout       text not null default 'cash' check (payout in ('cash','points')),
  note         text,
  created_at   timestamptz not null default now(),
  approved_at  timestamptz
);

create table if not exists public.plus_commissions (
  id            bigint generated always as identity primary key,
  affiliate_id  uuid not null references public.plus_affiliates(id) on delete restrict,
  order_number  text not null unique,
  source        text not null check (source in ('landing','app')),
  sku           text not null,
  sale          numeric(10,2) not null,
  commission    numeric(10,2) not null,
  status        text not null default 'pending' check (status in ('pending','paid','void')),
  payout        text,
  payout_ref    text,
  created_at    timestamptz not null default now(),
  paid_at       timestamptz
);
create index if not exists plus_commissions_aff on public.plus_commissions (affiliate_id, status);

alter table public.plus_landing_orders add column if not exists ref text;
alter table public.plus_orders         add column if not exists ref text;

-- Reading: your own row and your own commissions; admins everything.
-- Writing: only through the functions below.
alter table public.plus_affiliates  enable row level security;
alter table public.plus_commissions enable row level security;
drop policy if exists plus_affiliates_read on public.plus_affiliates;
create policy plus_affiliates_read on public.plus_affiliates
  for select using (user_id = auth.uid() or public.plus_is_admin());
drop policy if exists plus_commissions_read on public.plus_commissions;
create policy plus_commissions_read on public.plus_commissions
  for select using (public.plus_is_admin() or exists (
    select 1 from public.plus_affiliates a where a.id = affiliate_id and a.user_id = auth.uid()));

-- ── the rates (ringgit), one place ───────────────────────────────
create or replace function public.plus_affiliate_rate(p_sku text)
returns numeric language sql immutable as $$
  select case p_sku
    when 'prog_lad4'    then 10
    when 'sub_plus_6m'  then 30
    when 'sub_plus_12m' then 40
    else 0 end::numeric;
$$;

-- ── a paid order with a code: called by landing-pay and grant() ──
create or replace function public.plus_commission_record(
  p_order text, p_source text, p_sku text, p_sale numeric, p_ref text,
  p_buyer uuid default null, p_email text default null, p_phone text default null)
returns boolean language plpgsql security definer set search_path = public as $$
declare a public.plus_affiliates; v_rate numeric; v_d text;
begin
  if coalesce(p_ref, '') = '' then return false; end if;
  select * into a from public.plus_affiliates where code = upper(trim(p_ref)) and status = 'approved';
  if not found then return false; end if;
  v_rate := public.plus_affiliate_rate(p_sku);
  if v_rate <= 0 then return false; end if;
  -- not on your own purchase
  if p_buyer is not null and a.user_id = p_buyer then return false; end if;
  if coalesce(p_email, '') <> '' and lower(coalesce(a.email, '')) = lower(trim(p_email)) then return false; end if;
  v_d := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  if length(v_d) >= 9 and regexp_replace(coalesce(a.phone, ''), '\D', '', 'g') = v_d then return false; end if;
  insert into public.plus_commissions (affiliate_id, order_number, source, sku, sale, commission)
  values (a.id, p_order, p_source, p_sku, p_sale, v_rate)
  on conflict (order_number) do nothing;
  return true;
end $$;
revoke all on function public.plus_commission_record(text, text, text, numeric, text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.plus_commission_record(text, text, text, numeric, text, uuid, text, text) to service_role;

-- ── a member asks to join (or updates a pending ask) ─────────────
create or replace function public.plus_affiliate_apply(p_name text, p_phone text, p_payout text default 'cash')
returns public.plus_affiliates language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); r public.plus_affiliates; v_base text; v_code text; v_email text; i int := 0;
begin
  if me is null then raise exception 'Sign in first'; end if;
  if length(trim(coalesce(p_name, ''))) < 2 then raise exception 'Name needed'; end if;
  if length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) < 9 then raise exception 'Phone needed'; end if;
  select email into v_email from auth.users where id = me;
  select * into r from public.plus_affiliates where user_id = me;
  if found then
    update public.plus_affiliates set name = trim(p_name), phone = trim(p_phone),
      payout = case when p_payout in ('cash','points') then p_payout else payout end
    where id = r.id returning * into r;
    return r;
  end if;
  v_base := upper(left(regexp_replace(split_part(trim(p_name), ' ', 1), '[^A-Za-z]', '', 'g'), 8));
  if length(v_base) < 3 then v_base := 'HF' || v_base; end if;
  loop
    v_code := v_base || lpad((floor(random() * 100))::int::text, 2, '0');
    exit when not exists (select 1 from public.plus_affiliates where code = v_code);
    i := i + 1; if i > 50 then v_code := v_base || floor(random() * 10000)::int; exit; end if;
  end loop;
  insert into public.plus_affiliates (user_id, code, name, phone, email, payout)
  values (me, v_code, trim(p_name), trim(p_phone), v_email,
          case when p_payout in ('cash','points') then p_payout else 'cash' end)
  returning * into r;
  return r;
end $$;
grant execute on function public.plus_affiliate_apply(text, text, text) to authenticated;

-- ── what a member sees: their row, totals and recent sales ───────
create or replace function public.plus_affiliate_me()
returns jsonb language sql stable security definer set search_path = public as $$
  select case when a.id is null then null else jsonb_build_object(
    'code', a.code, 'name', a.name, 'status', a.status, 'payout', a.payout, 'kind', a.kind,
    'sales',   (select count(*) from public.plus_commissions c where c.affiliate_id = a.id and c.status <> 'void'),
    'pending', (select coalesce(sum(commission), 0) from public.plus_commissions c where c.affiliate_id = a.id and c.status = 'pending'),
    'paid',    (select coalesce(sum(commission), 0) from public.plus_commissions c where c.affiliate_id = a.id and c.status = 'paid'),
    'recent',  coalesce((select jsonb_agg(jsonb_build_object('sku', c.sku, 'commission', c.commission, 'status', c.status, 'at', c.created_at) order by c.created_at desc)
                 from (select * from public.plus_commissions c where c.affiliate_id = a.id order by created_at desc limit 20) c), '[]'::jsonb)
  ) end
  from (select 1) x left join public.plus_affiliates a on a.user_id = auth.uid();
$$;
grant execute on function public.plus_affiliate_me() to authenticated;

-- ── the desk (plus-admin.html) ────────────────────────────────────
create or replace function public.plus_admin_affiliates()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.plus_is_admin() then raise exception 'Not allowed'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', a.id, 'code', a.code, 'name', a.name, 'phone', a.phone, 'email', a.email, 'kind', a.kind,
      'status', a.status, 'payout', a.payout, 'created_at', a.created_at,
      'sales',   (select count(*) from public.plus_commissions c where c.affiliate_id = a.id and c.status <> 'void'),
      'pending', (select coalesce(sum(commission), 0) from public.plus_commissions c where c.affiliate_id = a.id and c.status = 'pending'),
      'paid',    (select coalesce(sum(commission), 0) from public.plus_commissions c where c.affiliate_id = a.id and c.status = 'paid')
    ) order by (a.status = 'pending') desc, a.created_at desc) from public.plus_affiliates a), '[]'::jsonb);
end $$;
grant execute on function public.plus_admin_affiliates() to authenticated;

-- approve, pause, change kind or code; also adds an agent who has no account
create or replace function public.plus_admin_affiliate_set(
  p_id uuid, p_status text default null, p_kind text default null, p_code text default null,
  p_name text default null, p_phone text default null, p_email text default null)
returns public.plus_affiliates language plpgsql security definer set search_path = public as $$
declare r public.plus_affiliates;
begin
  if not public.plus_is_admin() then raise exception 'Not allowed'; end if;
  if p_id is null then
    insert into public.plus_affiliates (code, name, phone, email, kind, status, approved_at)
    values (upper(trim(p_code)), trim(p_name), trim(p_phone), lower(trim(p_email)),
            coalesce(p_kind, 'agent'), 'approved', now())
    returning * into r;
  else
    update public.plus_affiliates set
      status = coalesce(p_status, status),
      kind   = coalesce(p_kind, kind),
      code   = coalesce(upper(nullif(trim(p_code), '')), code),
      approved_at = case when p_status = 'approved' and approved_at is null then now() else approved_at end
    where id = p_id returning * into r;
  end if;
  insert into public.plus_admin_log (admin_id, action, target, detail)
  values (auth.uid(), 'affiliate', r.code, jsonb_build_object('status', r.status, 'kind', r.kind));
  return r;
end $$;
grant execute on function public.plus_admin_affiliate_set(uuid, text, text, text, text, text, text) to authenticated;

-- a month's payout: every pending commission of one affiliate becomes paid
create or replace function public.plus_admin_affiliate_paid(p_id uuid, p_payout text, p_ref text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare n int; s numeric;
begin
  if not public.plus_is_admin() then raise exception 'Not allowed'; end if;
  with u as (
    update public.plus_commissions set status = 'paid', paid_at = now(),
      payout = case when p_payout in ('cash','points') then p_payout else 'cash' end, payout_ref = p_ref
    where affiliate_id = p_id and status = 'pending' returning commission)
  select count(*), coalesce(sum(commission), 0) into n, s from u;
  insert into public.plus_admin_log (admin_id, action, target, detail)
  values (auth.uid(), 'affiliate_paid', p_id::text, jsonb_build_object('n', n, 'sum', s, 'payout', p_payout, 'ref', p_ref));
  return jsonb_build_object('n', n, 'sum', s);
end $$;
grant execute on function public.plus_admin_affiliate_paid(uuid, text, text) to authenticated;

-- a commission that should not stand (a payment reversed, a mistake)
create or replace function public.plus_admin_commission_void(p_order text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.plus_is_admin() then raise exception 'Not allowed'; end if;
  update public.plus_commissions set status = 'void' where order_number = p_order and status = 'pending';
  insert into public.plus_admin_log (admin_id, action, target, detail) values (auth.uid(), 'commission_void', p_order, '{}'::jsonb);
end $$;
grant execute on function public.plus_admin_commission_void(text) to authenticated;
