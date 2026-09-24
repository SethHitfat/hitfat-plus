-- ═══════════════════════════════════════════════════════════════
--  HITFAT CLUB · check-in, rewards and InBody · V2 schema
--  Run once in Supabase project ercvaagznsndvrewlvgt, after 10-club-tables.sql.
--
--  10-club-tables.sql gave the Club its nouns. This file gives it the two
--  verbs the gym actually performs at the counter — "you are in" and "you
--  have redeemed" — and the one guard that makes them safe to expose.
--
--  The guard is that a member's QR is not a member's identity. The old
--  prototype put the phone number in the code, which meant a photograph of
--  someone's screen was a working key to their attendance forever. Here the
--  QR carries a token that this file's table issues, that expires in minutes,
--  and that is destroyed the moment it is used. Photograph it all you like.
-- ═══════════════════════════════════════════════════════════════

-- ── the check-in token behind the member's QR ───────────────────
-- One row per QR the member's phone is currently showing. The client never
-- reads or writes this table; the club-checkin edge function does both with
-- the service role. Rows are short-lived by design — see the sweep at the
-- bottom of this file.
create table if not exists public.club_checkin_tokens (
  token        uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  -- What the coach types when a camera will not focus, a screen is cracked,
  -- or a phone is flat. Six characters from an alphabet with no O/0 or I/1,
  -- because this gets read aloud across a noisy gym floor.
  short_code   text not null,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null,
  used_at      timestamptz,
  used_by      uuid references auth.users(id) on delete set null,
  session_id   uuid references public.club_sessions(id) on delete set null
);

-- A short code only has to be unique among the codes that could still be
-- redeemed. Making it globally unique would exhaust a six-character space
-- for no benefit and start rejecting honest check-ins after a year.
create unique index if not exists club_checkin_live_code
  on public.club_checkin_tokens (short_code)
  where used_at is null;

create index if not exists club_checkin_user
  on public.club_checkin_tokens (user_id, created_at desc);

alter table public.club_checkin_tokens enable row level security;
-- Deliberately no policies. RLS with no policy denies every client, which is
-- exactly right: a member who could read this table could read the token that
-- checks in the person standing next to them.

-- ── points, awarded once per session ────────────────────────────
-- club_points is a ledger, and a ledger with no uniqueness lets a coach who
-- taps twice pay twice. Attendance points are keyed on the booking they came
-- from, so the second insert is rejected by the database rather than by a
-- coach remembering.
create unique index if not exists club_points_once_per_attendance
  on public.club_points (user_id, kind, reference_id)
  where kind = 'class_attendance' and reference_id is not null;

-- ── redemptions need a balance, and a balance needs to be cheap ─
-- Summing the whole ledger on every redemption is fine at 200 members and
-- wrong at 2000. A view keeps the definition in one place; the edge function
-- reads it rather than re-deriving the sum in TypeScript.
create or replace view public.club_balances as
  select user_id, coalesce(sum(amount), 0)::int as balance
  from public.club_points
  group by user_id;

-- The view runs as its caller, so a member reading it sees only the ledger
-- rows their own club_points policy allows — which is their own. That is the
-- behaviour we want, and it is worth stating out loud because a view that
-- silently ran as its owner would leak every member's balance to every member.
alter view public.club_balances set (security_invoker = on);

-- ── spend points and record the redemption in one breath ────────
-- Two statements from an edge function can interleave with another request
-- from the same member on another device: both read 300 points, both redeem a
-- 250-point reward, and the ledger goes negative. Inside one function, under
-- one lock, they cannot.
create or replace function public.club_redeem(p_reward uuid)
returns public.club_redemptions
language plpgsql security definer set search_path = public as $$
declare
  v_user    uuid := auth.uid();
  v_reward  public.club_rewards;
  v_balance int;
  v_row     public.club_redemptions;
begin
  if v_user is null then
    raise exception 'Sign in to redeem' using errcode = '28000';
  end if;

  -- Lock the member's ledger tail first. Any concurrent redemption by the
  -- same member waits here rather than reading a balance we are about to
  -- spend. Locking the reward instead would serialise unrelated members.
  perform 1 from public.club_points where user_id = v_user for update;

  select * into v_reward from public.club_rewards where id = p_reward and active;
  if not found then
    raise exception 'That reward is not available' using errcode = 'P0002';
  end if;

  if v_reward.stock is not null and v_reward.stock <= 0 then
    raise exception 'That reward is out of stock' using errcode = 'P0003';
  end if;

  select coalesce(sum(amount), 0)::int into v_balance
  from public.club_points where user_id = v_user;

  if v_balance < v_reward.cost_points then
    raise exception 'Not enough points' using errcode = 'P0004';
  end if;

  insert into public.club_redemptions (user_id, reward_id, cost_points, status)
  values (v_user, p_reward, v_reward.cost_points, 'pending')
  returning * into v_row;

  -- The spend is a ledger row like any other. The balance is still never
  -- stored, so a cancelled redemption is undone by one compensating row.
  insert into public.club_points (user_id, amount, kind, reference_id, description)
  values (v_user, -v_reward.cost_points, 'redemption', v_row.id, v_reward.name);

  if v_reward.stock is not null then
    update public.club_rewards set stock = stock - 1 where id = p_reward;
  end if;

  return v_row;
end;
$$;

revoke all on function public.club_redeem(uuid) from public;
grant execute on function public.club_redeem(uuid) to authenticated;

-- ── the coach's register ────────────────────────────────────────
-- The coach console asks one question over and over: who is in the room
-- right now, and who was expected. Answering it from the client means three
-- round trips and a join the RLS policies were not written for.
create or replace function public.club_roster(p_session uuid)
returns table (
  user_id       uuid,
  name          text,
  member_no     text,
  status        text,
  checked_in_at timestamptz
)
language sql security definer set search_path = public as $$
  select b.user_id,
         coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as name,
         m.member_no,
         b.status,
         b.checked_in_at
  from public.club_bookings b
  join auth.users u on u.id = b.user_id
  left join public.club_members m on m.user_id = b.user_id
  where b.session_id = p_session
    and b.status <> 'cancelled'
    -- security definer bypasses RLS, so the staff check has to be here.
    -- Without this line any signed-in member could read the whole register.
    and public.club_is_staff()
  order by (b.checked_in_at is null), b.checked_in_at, name;
$$;

revoke all on function public.club_roster(uuid) from public;
grant execute on function public.club_roster(uuid) to authenticated;

-- ── staff write attendance; members never do ────────────────────
-- 10-club-tables.sql lets a member insert their own booking and cancel it,
-- and nothing else. Marking someone attended or no_show is the coach's job,
-- and the console does it with the member's own bookings row.
drop policy if exists club_bookings_staff_write on public.club_bookings;
create policy club_bookings_staff_write on public.club_bookings
  for update using (public.club_is_staff()) with check (public.club_is_staff());

drop policy if exists club_bookings_staff_insert on public.club_bookings;
create policy club_bookings_staff_insert on public.club_bookings
  for insert with check (public.club_is_staff());

-- Staff read the InBody history of the member they are sitting with. The
-- read policy in 10-club-tables.sql already allows it; the write side is
-- service-role only and stays that way.

-- ── housekeeping ────────────────────────────────────────────────
-- Tokens are worthless within minutes of being issued and there is no reason
-- to keep them. Without this the table grows by one row per QR refresh per
-- member per visit, forever.
create or replace function public.club_sweep_tokens()
returns void language sql security definer set search_path = public as $$
  delete from public.club_checkin_tokens
  where created_at < now() - interval '2 days';
$$;

-- Schedule it if pg_cron is installed; skip quietly if it is not, because a
-- missing extension must not fail the whole migration.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('club-sweep-tokens', '17 4 * * *',
                          'select public.club_sweep_tokens()');
  end if;
exception when others then
  raise notice 'pg_cron not scheduled: %', sqlerrm;
end $$;

-- ── seed: a few missions worth chasing ──────────────────────────
-- Rewards were seeded in 10-club-tables.sql. Missions are what makes the
-- points move, and an empty missions tab is the fastest way to make a
-- rewards screen feel broken.
create table if not exists public.club_missions (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  detail       text,
  kind         text not null default 'attendance'
               check (kind in ('attendance','streak','challenge','inbody','referral')),
  target       int not null check (target > 0),
  reward_points int not null check (reward_points > 0),
  window_days  int,                              -- null = all time
  active       boolean not null default true,
  sort         int not null default 0
);
alter table public.club_missions enable row level security;
drop policy if exists club_missions_read on public.club_missions;
create policy club_missions_read on public.club_missions
  for select using (active or public.club_is_staff());

insert into public.club_missions (title, detail, kind, target, reward_points, window_days, sort)
values
  ('First class of the week', 'Attend one class between Monday and Sunday.',
   'attendance', 1, 10, 7, 1),
  ('Three in seven days',     'Attend three classes inside a rolling week.',
   'attendance', 3, 40, 7, 2),
  ('Ten in the month',        'Ten classes in thirty days. This is the one that changes bodies.',
   'attendance', 10, 150, 30, 3),
  ('Two-week streak',         'Train at least twice a week, two weeks running.',
   'streak', 14, 100, 14, 4),
  ('Know your numbers',       'Record an InBody scan so your training has a baseline.',
   'inbody', 1, 50, null, 5)
on conflict do nothing;
