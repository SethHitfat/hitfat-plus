-- ═══════════════════════════════════════════════════════════════
--  HITFAT OS · connecting a class member is approved by the counter
--  (22 Oct 2026)
--
--  A REFERENCE COPY. This file is NOT for the HITFAT+ project. Run it in
--  the HITFAT OS project (os.hitfat.io, ref ddcmfbaidkrqpeckmzou), where
--  plus_ok, plus_phone, pt_live, v_member_status, members, plus_links and
--  points_awards already live (080_plus_bridge.sql and after, in
--  hitfat-membership-src). Safe to run again.
--
--  Supersedes the code path in 47-os-plus-claim-kod.sql. The owner's
--  decision: a member types only their phone number; the counter approves
--  them in person. 47's plus_claim_codes, plus_claim_code_issue and the
--  four-argument plus_claim are left in place, unused (plus-class no
--  longer calls them), so a rollback is one edge function deploy.
--
--  Deploy this first, then plus-class (src/deploy/plus-class/index.ts):
--  the new plus-class calls these functions, the old one never does.
--
--  The flow:
--    1. the member enters their number in HITFAT+ and taps connect:
--       plus_claim_request. Already connected to this same account: ok.
--       Connected to another: 'taken'. Otherwise a PENDING request, and
--       the answer 'pending'.
--    2. coach.html lists pending requests (plus_claim_pending): the
--       member's name, the number, and (added by plus-class) the email of
--       the HITFAT+ account asking. Staff check the person in front of
--       them owns that account.
--    3. Approve or reject (plus_claim_decide). Approve makes the link
--       exactly as plus_claim did; the member's next status call sees it.
--
--  A request lasts 24 hours. One pending request per account: asking for
--  another number ends the one before.
--
--  Who may call: plus-class calls OS with OS's anon key (it is public, it
--  ships in every os.hitfat.io page), so these functions must stay
--  executable by anon. What protects them is the bridge key: every one
--  starts with plus_ok(p_key), whose secret lives only in the HITFAT+
--  edge function (plus_settings 'os_bridge_key'). Staff standing is
--  checked there too (HITFAT+ club_members.role), before decide is called.
-- ═══════════════════════════════════════════════════════════════

-- ── the requests ─────────────────────────────────────────────────
-- RLS on and no policies: nobody reads this table except the security
-- definer functions below.
create table if not exists public.plus_claim_requests (
  id         bigserial primary key,
  member_id  uuid not null,
  plus_user  uuid not null,
  phone      text,
  status     text not null default 'pending'
             check (status in ('pending','approved','rejected','expired')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by text
);
-- one pending request per member and account; asking again refreshes it
create unique index if not exists plus_claim_requests_one_pending
  on public.plus_claim_requests (member_id, plus_user) where status = 'pending';
create index if not exists plus_claim_requests_open
  on public.plus_claim_requests (created_at desc) where status = 'pending';
alter table public.plus_claim_requests enable row level security;
revoke all on public.plus_claim_requests from public, anon, authenticated;
revoke all on sequence public.plus_claim_requests_id_seq from public, anon, authenticated;

-- ── the member asks ──────────────────────────────────────────────
-- The member is found exactly as plus_claim finds them: an ACTIVE class
-- membership on that number, else a live personal coaching package.
create or replace function public.plus_claim_request(p_key text, p_phone text, p_user uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  ph  text := plus_phone(p_phone);
  mid uuid;
  act boolean;
  lk  uuid;
  pm  uuid;
begin
  if not plus_ok(p_key) then raise exception 'denied'; end if;

  select v.member_id, v.effective_status = 'ACTIVE' into mid, act
    from v_member_status v
   where v.phone = ph and v.category in ('Membership','Ladies','Mens','HYROX')
   order by (v.effective_status = 'ACTIVE') desc, v.end_date desc nulls last
   limit 1;
  if mid is null or not act then
    select m.id into pm from members m where m.phone = ph and pt_live(m.id) is not null limit 1;
    if pm is not null then mid := pm; act := true; end if;
  end if;
  if mid is null then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if not act then return jsonb_build_object('ok', false, 'error', 'expired'); end if;

  -- already this account's: nothing to approve
  select plus_user into lk from plus_links where member_id = mid;
  if lk = p_user then return jsonb_build_object('ok', true); end if;
  if lk is not null then return jsonb_build_object('ok', false, 'error', 'taken'); end if;

  -- a day old is no longer pending, anywhere
  update plus_claim_requests set status = 'expired', decided_at = now()
   where status = 'pending' and created_at < now() - interval '24 hours';
  -- one number at a time per account: asking for another ends the last
  update plus_claim_requests set status = 'expired', decided_at = now()
   where status = 'pending' and plus_user = p_user and member_id <> mid;

  insert into plus_claim_requests (member_id, plus_user, phone)
  values (mid, p_user, ph)
  on conflict (member_id, plus_user) where status = 'pending'
  do update set created_at = now(), phone = excluded.phone;

  return jsonb_build_object('ok', false, 'error', 'pending');
end $$;

-- ── the counter's list ───────────────────────────────────────────
-- Pending and under a day old, newest first: the person at the counter is
-- almost always the last one to ask. The name is whichever name column
-- members has. linked_other: the member is already connected to another
-- account, so approving will be refused until staff release that link.
create or replace function public.plus_claim_pending(p_key text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  out jsonb;
begin
  if not plus_ok(p_key) then raise exception 'denied'; end if;

  update plus_claim_requests set status = 'expired', decided_at = now()
   where status = 'pending' and created_at < now() - interval '24 hours';

  select coalesce(jsonb_agg(x order by x.created_at desc), '[]'::jsonb) into out
    from (
      select r.id, r.member_id,
             coalesce(to_jsonb(m) ->> 'full_name', to_jsonb(m) ->> 'name', '') as name,
             r.phone, r.plus_user, r.created_at,
             exists (select 1 from plus_links l
                      where l.member_id = r.member_id and l.plus_user <> r.plus_user) as linked_other
        from plus_claim_requests r
        left join members m on m.id = r.member_id
       where r.status = 'pending' and r.created_at >= now() - interval '24 hours'
       order by r.created_at desc
       limit 50
    ) x;
  return out;
end $$;

-- ── the counter decides ──────────────────────────────────────────
-- Approve: check again that the member is still active and not taken,
-- then link with the same statements plus_claim used. Reject: closed.
-- plus_user comes back so plus-class can open the access at once.
create or replace function public.plus_claim_decide(p_key text, p_id bigint, p_approve boolean, p_staff text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  r   plus_claim_requests%rowtype;
  lk  uuid;
  who text := left(coalesce(p_staff, ''), 200);
begin
  if not plus_ok(p_key) then raise exception 'denied'; end if;

  select * into r from plus_claim_requests where id = p_id for update;
  if r.id is null then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if r.status <> 'pending' then return jsonb_build_object('ok', false, 'error', 'decided'); end if;
  if r.created_at < now() - interval '24 hours' then
    update plus_claim_requests set status = 'expired', decided_at = now() where id = r.id;
    return jsonb_build_object('ok', false, 'error', 'stale');
  end if;

  if not coalesce(p_approve, false) then
    update plus_claim_requests set status = 'rejected', decided_at = now(), decided_by = who where id = r.id;
    return jsonb_build_object('ok', true, 'plus_user', r.plus_user);
  end if;

  -- still a member? the same two ways in as plus_claim, by member id
  if not exists (select 1 from v_member_status v
                  where v.member_id = r.member_id and v.effective_status = 'ACTIVE'
                    and v.category in ('Membership','Ladies','Mens','HYROX'))
     and pt_live(r.member_id) is null then
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;

  -- connected to someone else since: staff release that link in OS first
  select plus_user into lk from plus_links where member_id = r.member_id;
  if lk is not null and lk <> r.plus_user then
    return jsonb_build_object('ok', false, 'error', 'taken');
  end if;

  delete from plus_links where plus_user = r.plus_user and member_id <> r.member_id;
  insert into plus_links (member_id, plus_user, phone) values (r.member_id, r.plus_user, r.phone)
  on conflict (member_id) do nothing;
  insert into points_awards (member_id, kind, points, note) values (r.member_id, 'link', 300, 'Connected HITFAT+')
  on conflict (member_id, kind) where kind in ('link','inbody') do nothing;

  update plus_claim_requests set status = 'approved', decided_at = now(), decided_by = who where id = r.id;
  return jsonb_build_object('ok', true, 'plus_user', r.plus_user);
end $$;

-- ── who may call ─────────────────────────────────────────────────
-- plus-class authenticates to OS with OS's anon key (apikey + Bearer), so
-- PostgREST runs these as anon: anon keeps execute, and the plus_ok key
-- guard on the first line of each is the protection. Nobody else needs them.
revoke all on function public.plus_claim_request(text, text, uuid)               from public, authenticated;
revoke all on function public.plus_claim_pending(text)                           from public, authenticated;
revoke all on function public.plus_claim_decide(text, bigint, boolean, text)     from public, authenticated;
grant execute on function public.plus_claim_request(text, text, uuid)            to anon, service_role;
grant execute on function public.plus_claim_pending(text)                        to anon, service_role;
grant execute on function public.plus_claim_decide(text, bigint, boolean, text)  to anon, service_role;
