-- ═══════════════════════════════════════════════════════════════
--  HITFAT CLUB · V1 schema
--  Run once in Supabase project ercvaagznsndvrewlvgt (the HITFAT+ one).
--
--  Seven tables, not the sixteen sketched in the brief. Three of the
--  suggested ones describe the same row at different moments and are
--  folded in deliberately:
--
--    club_class_sessions + club_classes  → club_sessions
--        A class type with no scheduled occurrence has nothing to book.
--        For one gym, the type is a column, not a table. Split them when
--        a second location or a per-type price appears.
--
--    club_waitlist    → club_bookings, status 'waitlisted'
--    club_attendance  → club_bookings, status 'attended'
--        A waitlist entry and an attendance record ARE bookings, at a
--        different point in their life. Keeping three tables in step is
--        a whole class of bug — a member cancelling in one and staying
--        in another — that a status column simply cannot have.
--
--  Challenges, achievements and streaks are NOT here. HITFAT+ already
--  computes all three from logged sessions; Club attendance becomes
--  another source feeding them rather than a parallel system.
-- ═══════════════════════════════════════════════════════════════

-- ── who is a member, and of what ────────────────────────────────
-- One row per person who has any Club standing at all. A HITFAT+ user
-- with no row here is a general_user and never sees the Club.
create table if not exists public.club_members (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'gym_member'
               check (role in ('gym_member','hyrox_member','coach','staff','admin')),
  member_no    text unique,                    -- what the front desk says out loud
  plan         text,                           -- 'Unlimited Class', 'Class Credits'…
  status       text not null default 'active'
               check (status in ('active','frozen','expired','cancelled')),
  started_on   date,
  expires_on   date,
  credits_left int,                            -- null for unlimited plans
  goal         text,                           -- 'Lose Fat', 'HYROX'…
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── a class that actually happens at a time ─────────────────────
create table if not exists public.club_sessions (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,                  -- 'Strength & Conditioning'
  kind         text,                           -- 'HIIT' | 'STRENGTH' | 'MOBILITY'
  coach_name   text,
  coach_id     uuid references auth.users(id) on delete set null,
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  capacity     int not null default 20 check (capacity > 0),
  status       text not null default 'scheduled'
               check (status in ('scheduled','cancelled','done')),
  -- Check-in token. Rotated per session and time-boxed, so a photograph
  -- of yesterday's QR opens nothing.
  qr_token     uuid not null default gen_random_uuid(),
  qr_valid_from timestamptz,
  qr_valid_to   timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists club_sessions_when on public.club_sessions (starts_at);

-- ── one row per member per session, whatever became of it ───────
create table if not exists public.club_bookings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  session_id   uuid not null references public.club_sessions(id) on delete cascade,
  status       text not null default 'booked'
               check (status in ('booked','waitlisted','cancelled','attended','no_show')),
  booked_at    timestamptz not null default now(),
  checked_in_at timestamptz,
  unique (user_id, session_id)                 -- cannot book the same class twice
);
create index if not exists club_bookings_session on public.club_bookings (session_id, status);
create index if not exists club_bookings_user on public.club_bookings (user_id, booked_at desc);

-- ── points, as a ledger ─────────────────────────────────────────
-- A balance column with no history cannot answer "where did my points
-- go", cannot be audited, and cannot be corrected without guessing.
-- The balance is the sum; it is never stored.
create table if not exists public.club_points (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  amount       int not null,                   -- negative for a redemption
  kind         text not null
               check (kind in ('class_attendance','monthly_challenge','streak_bonus',
                               'referral','membership','manual','redemption')),
  reference_id uuid,                           -- the session, the redemption…
  description  text,
  created_at   timestamptz not null default now()
);
create index if not exists club_points_user on public.club_points (user_id, created_at desc);

-- ── what points buy ─────────────────────────────────────────────
create table if not exists public.club_rewards (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text,                           -- 'drinks' | 'merch' | 'training'…
  cost_points  int not null check (cost_points > 0),
  stock        int,                            -- null = unlimited
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.club_redemptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  reward_id    uuid not null references public.club_rewards(id),
  cost_points  int not null,                   -- copied, so later price changes
                                               -- do not rewrite history
  status       text not null default 'pending'
               check (status in ('pending','collected','cancelled')),
  created_at   timestamptz not null default now()
);
create index if not exists club_redemptions_user on public.club_redemptions (user_id, created_at desc);

-- ── InBody ──────────────────────────────────────────────────────
create table if not exists public.club_inbody (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  scan_date    date not null,
  score        numeric, weight numeric, smm numeric, bfm numeric, pbf numeric,
  bmi numeric, vfa numeric, bmr numeric, tbw numeric,
  protein numeric, mineral numeric, whr numeric, smi numeric,
  segmental    jsonb,                          -- trunk / arms / legs, lean and fat
  raw          jsonb,                          -- exactly what the extractor returned
  created_at   timestamptz not null default now(),
  unique (user_id, scan_date)                  -- one scan a day replaces, not stacks
);
create index if not exists club_inbody_user on public.club_inbody (user_id, scan_date desc);

-- ═══════════════════════════════════════════════════════════════
--  Row level security
--
--  Body composition and attendance are health data. The default is that
--  nobody but the owner reads them. Staff access is granted explicitly
--  and only where the job needs it.
-- ═══════════════════════════════════════════════════════════════
alter table public.club_members     enable row level security;
alter table public.club_sessions    enable row level security;
alter table public.club_bookings    enable row level security;
alter table public.club_points      enable row level security;
alter table public.club_rewards     enable row level security;
alter table public.club_redemptions enable row level security;
alter table public.club_inbody      enable row level security;

-- Helper: is the caller staff? Security definer so the policy can read
-- club_members without recursing through club_members' own policy.
create or replace function public.club_is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.club_members
    where user_id = auth.uid() and role in ('coach','staff','admin')
  );
$$;

-- club_members: read your own row; staff read all. Only the service role
-- writes — a member must not be able to extend their own membership.
drop policy if exists club_members_read_own on public.club_members;
create policy club_members_read_own on public.club_members
  for select using (user_id = auth.uid() or public.club_is_staff());

-- club_sessions: the timetable is public to signed-in users. qr_token is
-- NOT protected by this and must never be selected by the client —
-- the check-in edge function reads it with the service role.
drop policy if exists club_sessions_read on public.club_sessions;
create policy club_sessions_read on public.club_sessions
  for select using (auth.uid() is not null);

-- club_bookings: your own, plus staff. A member may create and cancel
-- their own booking; only the server marks one attended.
drop policy if exists club_bookings_read on public.club_bookings;
create policy club_bookings_read on public.club_bookings
  for select using (user_id = auth.uid() or public.club_is_staff());

drop policy if exists club_bookings_insert_own on public.club_bookings;
create policy club_bookings_insert_own on public.club_bookings
  for insert with check (user_id = auth.uid() and status in ('booked','waitlisted'));

drop policy if exists club_bookings_cancel_own on public.club_bookings;
create policy club_bookings_cancel_own on public.club_bookings
  for update using (user_id = auth.uid()) with check (status = 'cancelled');

-- club_points: read your own ledger. Nobody writes from the client —
-- a client that can insert points can award itself a shirt.
drop policy if exists club_points_read_own on public.club_points;
create policy club_points_read_own on public.club_points
  for select using (user_id = auth.uid() or public.club_is_staff());

-- club_rewards: the catalogue is readable; only the service role edits it.
drop policy if exists club_rewards_read on public.club_rewards;
create policy club_rewards_read on public.club_rewards
  for select using (active or public.club_is_staff());

-- club_redemptions: your own. Created by the server so the balance can be
-- checked in the same breath as the spend.
drop policy if exists club_redemptions_read_own on public.club_redemptions;
create policy club_redemptions_read_own on public.club_redemptions
  for select using (user_id = auth.uid() or public.club_is_staff());

-- club_inbody: yours alone, plus staff. Deliberately no member-to-member
-- read of any kind.
drop policy if exists club_inbody_read_own on public.club_inbody;
create policy club_inbody_read_own on public.club_inbody
  for select using (user_id = auth.uid() or public.club_is_staff());

-- ═══════════════════════════════════════════════════════════════
--  Seed: the rewards catalogue from the old app, priced as it was.
-- ═══════════════════════════════════════════════════════════════
insert into public.club_rewards (name, category, cost_points) values
  ('Mineral Water',        'drinks',     20),
  ('Protein Shake',        'drinks',    110),
  ('Whey Protein',         'drinks',    130),
  ('Bring a Friend Pass',  'training',  150),
  ('Renewal Discount RM30','membership',250),
  ('Body Check Session',   'services',  300),
  ('Shaker / Towel',       'merch',     350),
  ('HITFAT Shirt',         'merch',     450),
  ('Training Pass · 7 Days',  'training',  600),
  ('Training Pass · 14 Days', 'training', 1100),
  ('Training Pass · 30 Days', 'training', 1800)
on conflict do nothing;

-- ── after running this, make yourself a member ──────────────────
-- Replace the uuid with your own from Authentication → Users.
--
-- insert into public.club_members (user_id, role, member_no, plan, status,
--                                  started_on, expires_on)
-- values ('YOUR-AUTH-UUID','admin','HF-0001','Unlimited Class','active',
--         current_date, current_date + interval '90 days')
-- on conflict (user_id) do update set role = excluded.role;
