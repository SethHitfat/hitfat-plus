-- ═══════════════════════════════════════════════════════════════
--  HITFAT OS · connecting a class member needs a code from the counter
--  (22 Oct 2026)
--
--  A REFERENCE COPY. This file is NOT for the HITFAT+ project. Run it in
--  the HITFAT OS project (os.hitfat.io, ref ddcmfbaidkrqpeckmzou), where
--  plus_ok, plus_phone, pt_live, v_member_status, members, plus_links and
--  points_awards already live (080_plus_bridge.sql and after, in
--  hitfat-membership-src). Safe to run again.
--
--  Deploy together with plus-class (src/deploy/plus-class/index.ts): this
--  drops the old three-argument plus_claim, so until the new function is
--  deployed every claim fails (closed, not open).
--
--  Why: plus_claim used to connect a HITFAT+ account to a member on the
--  phone number alone. Anyone who knew a member's number could take their
--  link: their name, InBody scans, check-ins and records, free HITFAT+ All
--  Access, and the real member locked out with 'taken'. Now the counter
--  issues a six-digit code to the member standing in front of it
--  (plus_claim_code_issue, from coach.html through plus-class), good for
--  30 minutes and once, and plus_claim refuses without it.
--
--  A member already connected to this same account is let through without
--  a code, so the app's existing links keep working.
--
--  Who may call: plus-class calls OS with OS's anon key (it is public, it
--  ships in every os.hitfat.io page), so these functions must stay
--  executable by anon. What protects them is the bridge key: every one
--  starts with plus_ok(p_key), whose secret lives only in the HITFAT+
--  edge function (plus_settings 'os_bridge_key').
-- ═══════════════════════════════════════════════════════════════

-- ── the codes ────────────────────────────────────────────────────
-- Only the sha256 of member id + code is kept. RLS on and no policies:
-- nobody reads this table except the security definer functions below.
create table if not exists public.plus_claim_codes (
  id         bigserial primary key,
  member_id  uuid not null,
  code_hash  text not null,
  expires_at timestamptz not null,
  used_at    timestamptz,
  issued_by  text,
  tries      int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists plus_claim_codes_member on public.plus_claim_codes (member_id, created_at desc);
alter table public.plus_claim_codes enable row level security;
revoke all on public.plus_claim_codes from public, anon, authenticated;

-- tries: wrong codes against one member's live code. plus-class limits
-- each account to 5 claims an hour; this limits the code itself (the 5 in
-- plus_claim), so a stranger with many accounts still has 5 guesses in a
-- million before the counter has to issue a new one.

-- ── the counter issues one ───────────────────────────────────────
-- The member is found exactly as plus_claim finds them: an ACTIVE class
-- membership on that number, else a live personal coaching package.
create or replace function public.plus_claim_code_issue(p_key text, p_phone text, p_staff text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  ph   text := plus_phone(p_phone);
  mid  uuid;
  act  boolean;
  cat  text;
  pm   uuid;
  b    bytea;
  code text;
  exp  timestamptz := now() + interval '30 minutes';
  nm   text;
  lk   uuid;
begin
  if not plus_ok(p_key) then raise exception 'denied'; end if;

  select v.member_id, v.effective_status = 'ACTIVE', v.category into mid, act, cat
    from v_member_status v
   where v.phone = ph and v.category in ('Membership','Ladies','Mens','HYROX')
   order by (v.effective_status = 'ACTIVE') desc, v.end_date desc nulls last
   limit 1;
  if mid is null or not act then
    select m.id into pm from members m where m.phone = ph and pt_live(m.id) is not null limit 1;
    if pm is not null then mid := pm; act := true; cat := 'PT'; end if;
  end if;
  if mid is null then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  if not act then return jsonb_build_object('ok', false, 'error', 'expired'); end if;

  -- six digits from the CSPRNG, not random()
  b := extensions.gen_random_bytes(4);
  code := lpad(((((get_byte(b,0)::bigint << 24) | (get_byte(b,1)::bigint << 16)
                | (get_byte(b,2)::bigint << 8) | get_byte(b,3)::bigint) % 1000000))::text, 6, '0');

  -- one live code per member: a new one ends the old
  update plus_claim_codes set expires_at = now()
   where member_id = mid and used_at is null and expires_at > now();
  insert into plus_claim_codes (member_id, code_hash, expires_at, issued_by)
  values (mid, encode(extensions.digest(mid::text || ':' || code, 'sha256'), 'hex'), exp,
          left(coalesce(p_staff, ''), 200));

  -- the name for the counter to read back to the member; whichever name
  -- column members has
  select coalesce(to_jsonb(m) ->> 'full_name', to_jsonb(m) ->> 'name', '') into nm
    from members m where m.id = mid;
  -- already connected to an account: the code will be refused as 'taken'
  -- unless staff release the link first
  select plus_user into lk from plus_links where member_id = mid;

  return jsonb_build_object('ok', true, 'code', code, 'name', nm, 'category', cat,
                            'expires_at', exp, 'linked', lk is not null);
end $$;

-- ── the member connects, with the code ──────────────────────────
-- The old body, plus: before the link is made, an unexpired, unused code
-- for this member must match (and is spent). Already connected to this
-- same account: no code needed.
drop function if exists public.plus_claim(text, text, uuid);

create or replace function public.plus_claim(p_key text, p_phone text, p_user uuid, p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  ph  text := plus_phone(p_phone);
  mid uuid;
  act boolean;
  lk  uuid;
  pm  uuid;
  cid bigint;
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

  select plus_user into lk from plus_links where member_id = mid;
  if lk is not null and lk <> p_user then return jsonb_build_object('ok', false, 'error', 'taken'); end if;

  if lk is distinct from p_user then
    select c.id into cid from plus_claim_codes c
     where c.member_id = mid and c.used_at is null and c.expires_at > now() and c.tries < 5
       and p_code ~ '^\d{6}$'
       and c.code_hash = encode(extensions.digest(mid::text || ':' || p_code, 'sha256'), 'hex')
     order by c.created_at desc limit 1
     for update;
    if cid is null then
      -- a wrong guess counts against the member's live code (5 and it is spent)
      update plus_claim_codes set tries = tries + 1
       where member_id = mid and used_at is null and expires_at > now();
      return jsonb_build_object('ok', false, 'error', 'bad_code');
    end if;
    update plus_claim_codes set used_at = now() where id = cid;
  end if;

  delete from plus_links where plus_user = p_user and member_id <> mid;
  insert into plus_links (member_id, plus_user, phone) values (mid, p_user, ph)
  on conflict (member_id) do nothing;
  insert into points_awards (member_id, kind, points, note) values (mid, 'link', 300, 'Connected HITFAT+')
  on conflict (member_id, kind) where kind in ('link','inbody') do nothing;
  return jsonb_build_object('ok', true);
end $$;

-- ── who may call ─────────────────────────────────────────────────
-- plus-class authenticates to OS with OS's anon key (apikey + Bearer), so
-- PostgREST runs these as anon: anon keeps execute, and the plus_ok key
-- guard on the first line of each is the protection. Nobody else needs them.
revoke all on function public.plus_claim_code_issue(text, text, text) from public, authenticated;
revoke all on function public.plus_claim(text, text, uuid, text)       from public, authenticated;
grant execute on function public.plus_claim_code_issue(text, text, text) to anon, service_role;
grant execute on function public.plus_claim(text, text, uuid, text)       to anon, service_role;
