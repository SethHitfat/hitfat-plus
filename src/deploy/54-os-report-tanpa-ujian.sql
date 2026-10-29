-- ============================================================
-- HITFAT+ · laporan OS tanpa data ujian (30 Okt 2026, Seth: "buang data ujian")
--
-- Pesanan ujian dan akaun dalaman TIDAK dipadam (rekod bayaran kekal untuk
-- akaun). Ia disenaraikan dalam plus_report_exclude, dan os_report() v3
-- tidak mengiranya: jualan, pembeli MAK2FIT, pengguna, sesi, scan, akses.
-- Tambah satu baris untuk mengecualikan pesanan atau akaun lain:
--   insert into plus_report_exclude(kind, ref, note) values ('order','HL…','ujian');
--   insert into plus_report_exclude(kind, ref, note) values ('user','<uuid>','staf');
-- Idempotent.
-- ============================================================

create table if not exists public.plus_report_exclude (
  kind       text not null check (kind in ('order', 'user')),
  ref        text not null,
  note       text,
  created_at timestamptz not null default now(),
  primary key (kind, ref)
);
alter table public.plus_report_exclude enable row level security;
revoke all on public.plus_report_exclude from anon, authenticated;

insert into public.plus_report_exclude(kind, ref, note) values
  ('order', 'HLMVL1YOW4F45JBT', 'Seth Test, MAK2FIT 23 Okt'),
  ('order', 'HLMVQAJXIMH6CPY3', 'Asyrani, ujian DuitNow MAK2FIT 27 Okt'),
  ('order', 'HPMV556FRBWBAD',   'Seth, BURN30 dalam app, tidak dibayar'),
  ('user',  '32e918de-e724-4bf7-872f-ed2bfca90c8a', 'Seth (sethnasser1991)'),
  ('user',  'd5775510-e900-4558-93f1-e3f02c3915eb', 'HITFAT (hitfat91)'),
  ('user',  'e79ad0a0-e1ca-4981-9e17-27b828eb596a', 'OFFICE HITFAT'),
  ('user',  '45131278-4adf-4a7c-b4fb-8b7a42a8666b', 'akaun ujian kuat7test1')
on conflict (kind, ref) do nothing;

create table if not exists public.os_report_key (
  id         integer primary key default 1 check (id = 1),
  key_hash   text not null,
  updated_at timestamptz not null default now()
);
alter table public.os_report_key enable row level security;
revoke all on public.os_report_key from anon, authenticated;

create or replace function public.os_report(p_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  tz  constant text := 'Asia/Kuala_Lumpur';
  now_my date := (now() at time zone tz)::date;
  res jsonb;
begin
  if not exists (
    select 1 from os_report_key
     where key_hash = encode(sha256(convert_to(coalesce(p_key, ''), 'UTF8')), 'hex')
  ) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  with
  ex_u as (select ref::uuid as id from plus_report_exclude where kind = 'user'),
  ex_o as (select ref from plus_report_exclude where kind = 'order'),
  usr  as (select * from auth.users u where u.id not in (select id from ex_u)),
  ses  as (select * from plus_sessions s where s.user_id not in (select id from ex_u)),
  scn  as (select * from plus_scans s where s.user_id not in (select id from ex_u)),
  dat  as (select * from plus_data d where d.user_id not in (select id from ex_u)),
  ent  as (select * from plus_entitlements e where e.user_id not in (select id from ex_u)),
  pus  as (select * from plus_push_subs p where p.user_id not in (select id from ex_u)),
  -- semua jualan: checkout landing page + beli dalam app, tanpa ujian
  sales_all as (
    select 'landing'::text as via, lo.sku, lo.amount, lo.status, lo.created_at, lo.paid_at,
           lo.name, lo.phone, lo.email, lo.order_number, lo.ref,
           (select lp.claimed_by from plus_landing_purchases lp where lp.order_number = lo.order_number) as uid
      from plus_landing_orders lo
    union all
    select 'app', o.sku, o.amount, o.status, o.created_at, o.paid_at,
           coalesce(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', u.email),
           coalesce(u.phone, u.raw_user_meta_data->>'phone'), u.email, o.order_number, o.ref, o.user_id
      from plus_orders o left join auth.users u on u.id = o.user_id
  ),
  sales as (
    select * from sales_all
     where order_number not in (select ref from ex_o)
       and (uid is null or uid not in (select id from ex_u))
  ),
  paid as (
    select *, (paid_at at time zone tz)::date as d
      from sales where status in ('paid', 'success', 'completed') and paid_at is not null
  ),
  act as (
    select user_id, started_at as at from ses
    union all select user_id, created_at from scn
    union all select user_id, updated_at from dat
  ),
  -- 30 Okt 2026 (Seth: "siapa tahu… orang buka ke"): setiap orang, berapa
  -- workout dan bila kali terakhir dia guna app
  usage as (
    select a.user_id, max(a.at) as last_active,
           (select count(*) from ses s where s.user_id = a.user_id) as workouts,
           (select count(*) from ses s where s.user_id = a.user_id and s.started_at >= now() - interval '7 days') as workouts7
      from act a group by a.user_id
  )
  select jsonb_build_object(
    'generated_at', now(),

    'users', jsonb_build_object(
      'total',    (select count(*) from usr),
      'new7',     (select count(*) from usr where created_at >= now() - interval '7 days'),
      'new30',    (select count(*) from usr where created_at >= now() - interval '30 days'),
      'active7',  (select count(distinct user_id) from act where at >= now() - interval '7 days'),
      'active30', (select count(distinct user_id) from act where at >= now() - interval '30 days'),
      'push',     (select count(distinct user_id) from pus)
    ),

    'products', coalesce((
      select jsonb_agg(p order by (p->>'paid_rm')::numeric desc) from (
        select jsonb_build_object(
          'sku', sku,
          'paid_n',    count(*) filter (where status in ('paid','success','completed')),
          'paid_rm',   coalesce(sum(amount) filter (where status in ('paid','success','completed')), 0),
          'paid30_n',  count(*) filter (where status in ('paid','success','completed') and paid_at >= now() - interval '30 days'),
          'paid30_rm', coalesce(sum(amount) filter (where status in ('paid','success','completed') and paid_at >= now() - interval '30 days'), 0),
          'open_n',    count(*) filter (where status not in ('paid','success','completed')),
          'open_rm',   coalesce(sum(amount) filter (where status not in ('paid','success','completed')), 0),
          'last_paid', max(paid_at)
        ) as p
        from sales group by sku
      ) x), '[]'::jsonb),

    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('d', g.d, 'n', coalesce(t.n, 0), 'rm', coalesce(t.rm, 0)) order by g.d)
        from (select now_my - i as d from generate_series(0, 29) i) g
        left join (select d, count(*) n, sum(amount) rm from paid group by d) t on t.d = g.d
      ), '[]'::jsonb),

    'mak2fit', jsonb_build_object(
      'buyers', coalesce((
        select jsonb_agg(b order by b->>'paid_at' desc) from (
          select jsonb_build_object(
            'name', p.name, 'phone', p.phone, 'email', p.email, 'amount', p.amount,
            'paid_at', p.paid_at, 'via', p.via, 'ref', p.ref, 'order', p.order_number,
            'workouts', coalesce((select us.workouts from usage us where us.user_id = p.uid), 0),
            'workouts7', coalesce((select us.workouts7 from usage us where us.user_id = p.uid), 0),
            'last_active', (select us.last_active from usage us where us.user_id = p.uid),
            'claimed', case when p.via = 'app' then true
                            else exists (select 1 from plus_landing_purchases lp
                                          where lp.order_number = p.order_number and lp.claimed_by is not null) end
          ) as b
          from paid p where p.sku = 'prog_lad4'
        ) x), '[]'::jsonb),
      'unpaid', coalesce((
        select jsonb_agg(jsonb_build_object('name', name, 'phone', phone, 'amount', amount,
                                            'status', status, 'created_at', created_at, 'via', via)
                         order by created_at desc)
          from sales where sku = 'prog_lad4' and status not in ('paid','success','completed')
        ), '[]'::jsonb),
      'entitled', (select count(distinct user_id) from ent where sku in ('prog_lad4', 'bundle_all')),
      'started',  (select count(distinct user_id) from ses where program = 'lad4'),
      'active7',  (select count(distinct user_id) from ses where program = 'lad4' and started_at >= now() - interval '7 days'),
      'sessions', (select count(*) from ses where program = 'lad4'),
      'finished', (select count(*) from ses where program = 'lad4' and finished_at is not null)
    ),

    -- jualan terkini, semua produk, yang terbaru dahulu
    'recent_sales', coalesce((
      select jsonb_agg(x order by x->>'paid_at' desc) from (
        select jsonb_build_object('name', p.name, 'phone', p.phone, 'sku', p.sku, 'amount', p.amount, 'paid_at', p.paid_at,
                 'via', p.via, 'opened', p.uid is not null or p.via = 'app',
                 'workouts', coalesce(us.workouts, 0), 'last_active', us.last_active) as x
          from paid p left join usage us on us.user_id = p.uid
         order by p.paid_at desc limit 15) r
      ), '[]'::jsonb),

    -- pengguna baru: siapa buka app, siapa berlatih, siapa bayar
    'recent_users', coalesce((
      select jsonb_agg(x order by x->>'joined' desc) from (
        select jsonb_build_object(
                 'name', coalesce(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
                 'email', u.email, 'joined', u.created_at,
                 'last_active', us.last_active, 'workouts', coalesce(us.workouts, 0),
                 'paid', exists (select 1 from ent e where e.user_id = u.id and coalesce(e.source, '') not like 'admin%' and e.sku <> 'sub_plus_class'),
                 'cls',  exists (select 1 from ent e where e.user_id = u.id and e.sku = 'sub_plus_class')) as x
          from usr u left join usage us on us.user_id = u.id
         order by u.created_at desc limit 20) r
      ), '[]'::jsonb),

    'programs', coalesce((
      select jsonb_agg(jsonb_build_object('program', program, 'sessions', n, 'users', u, 'sessions7', n7, 'last', last)
                       order by n desc)
        from (select coalesce(program, '-') as program, count(*) n, count(distinct user_id) u,
                     count(*) filter (where started_at >= now() - interval '7 days') n7, max(started_at) last
                from ses group by 1) s
      ), '[]'::jsonb),

    'scans', jsonb_build_object(
      'total',  (select count(*) from scn),
      'last30', (select count(*) from scn where created_at >= now() - interval '30 days'),
      'users30',(select count(distinct user_id) from scn where created_at >= now() - interval '30 days')
    ),

    'entitlements', coalesce((
      select jsonb_agg(jsonb_build_object('sku', sku, 'n', n, 'given', g) order by n desc)
        from (select sku, count(*) n, count(*) filter (where source like 'admin%') g
                from ent
               where expires_at is null or expires_at > now()
               group by sku) e
      ), '[]'::jsonb),

    'affiliates', jsonb_build_object(
      'pending',  (select count(*) from plus_affiliates where status = 'pending'),
      'approved', (select count(*) from plus_affiliates where status in ('approved', 'active')),
      'comm_rm',  (select coalesce(sum(commission), 0) from plus_commissions),
      'comm_unpaid_rm', (select coalesce(sum(commission), 0) from plus_commissions where paid_at is null)
    )
  ) into res;

  return res;
end;
$$;

revoke all on function public.os_report(text) from public, authenticated;
grant execute on function public.os_report(text) to anon;

select 'os_report v3 ready (tanpa data ujian)' as status;
