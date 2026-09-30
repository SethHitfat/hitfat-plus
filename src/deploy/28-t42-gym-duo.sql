-- ═══════════════════════════════════════════════════════════════
--  T42 · GYM DUO, SOLD BESIDE ONLINE
--  Run after 27-t42-engine.sql. Safe to run again — and run it again after
--  re-running 21- (the seed rewrites the edition's config).
--
--  Gym Duo was built (26-) but switched off per edition (gym_enabled). This
--  file is what selling it needs, and nothing else:
--
--    1. ITS OWN PRICE. Gym Duo carries a coach, the gym floor and InBody;
--       Online does not. gym_price_rm sits beside price_rm and is per
--       PERSON — each partner pays for their own place. Null falls back to
--       price_rm. pay-create charges it; the app shows it.
--
--    2. ONLY WHAT THE EDITION SELLS. The app already hides Gym Duo when
--       gym_enabled is off; the database now refuses it too, so a browser
--       cannot register into a mode nobody is running. The mode is fixed
--       once registered (members have no UPDATE policy on registrations),
--       so nobody pays the online price and moves to the gym.
--
--    3. THE GYM COMES WITH THE PLACE. Club check-in refuses anyone without
--       a club_members row, and until now only an admin could create one
--       (t42_gym_enrol). A paid Gym Duo place now grants it by itself. A
--       grant that fails never fails the payment: it leaves a
--       'gym_access_failed' note and staff grant it by hand as before.
--
--    4. NOVEMBER 2026 SELLS BOTH.
-- ═══════════════════════════════════════════════════════════════


-- ── run order ───────────────────────────────────────────────────
do $order$
begin
  if to_regprocedure('public.t42_has_access(uuid)') is null
     or to_regprocedure('public.t42_gym_enrol(uuid)') is null then
    raise exception 'Run 20- to 27-t42-*.sql first — this file builds on them.';
  end if;
end
$order$;


-- ═══════════════════════════════════════════════════════════════
--  1 · A PRICE PER MODE
-- ═══════════════════════════════════════════════════════════════
alter table public.t42_challenges add column if not exists gym_price_rm numeric(8,2);

do $c$
begin
  if not exists (select 1 from pg_constraint where conname = 't42_gym_price_positive') then
    alter table public.t42_challenges
      add constraint t42_gym_price_positive check (gym_price_rm is null or gym_price_rm > 0);
  end if;
end
$c$;

-- What one place costs in this mode. pay-create and the app give the same
-- answer (t42ModePrice in both).
create or replace function public.t42_price(p_challenge uuid, p_mode text)
returns numeric language sql stable set search_path = public as $$
  select case when p_mode = 'gym_duo' then coalesce(c.gym_price_rm, c.price_rm)
              else c.price_rm end
    from public.t42_challenges c where c.id = p_challenge;
$$;
grant execute on function public.t42_price(uuid, text) to anon, authenticated;


-- ═══════════════════════════════════════════════════════════════
--  2 · ONLY THE MODES THE EDITION RUNS
-- ═══════════════════════════════════════════════════════════════
create or replace function public.t42_guard_mode()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.t42_is_staff() then return new; end if;
  if new.mode = 'gym_duo' and not exists (
       select 1 from public.t42_challenges c
        where c.id = new.challenge_id and (c.config ->> 'gym_enabled') = 'true') then
    raise exception 'Gym Duo is not part of this T42' using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists t42_guard_mode on public.t42_registrations;
create trigger t42_guard_mode before insert on public.t42_registrations
  for each row execute function public.t42_guard_mode();


-- ═══════════════════════════════════════════════════════════════
--  3 · A PAID GYM DUO PLACE COMES WITH THE GYM
-- ═══════════════════════════════════════════════════════════════
-- The grant itself, with no permission check: called by the admin RPC and
-- by the payment trigger below. Never granted to a browser.
create or replace function public.t42_gym_grant(p_registration uuid, p_by uuid)
returns text language plpgsql security definer set search_path = public as $$
declare r public.t42_registrations%rowtype; ch public.t42_challenges%rowtype; v_end date;
begin
  select * into r from public.t42_registrations where id = p_registration;
  if not found or r.mode <> 'gym_duo' then
    raise exception 'Not a Gym Duo registration' using errcode = 'check_violation';
  end if;
  select * into ch from public.t42_challenges where id = r.challenge_id;
  v_end := ch.starts_on + ch.total_days - 1;

  insert into public.club_members (user_id, role, plan, status, started_on, expires_on, goal)
  values (r.user_id, 'gym_member', 'T42 Gym', 'active', least(current_date, ch.starts_on), v_end, 'T42')
  on conflict (user_id) do update
     set status     = 'active',
         expires_on = greatest(coalesce(public.club_members.expires_on, excluded.expires_on), excluded.expires_on),
         updated_at = now()
   where public.club_members.role in ('gym_member','hyrox_member');

  insert into public.t42_admin_notes (challenge_id, registration_id, action, detail, acted_by)
  values (ch.id, r.id, 'gym_access', 'Club access until ' || v_end, p_by);
  return 'Gym access until ' || v_end;
end $$;

-- REPLACES the one in 26-t42-gym.sql with the same behaviour: an admin
-- granting gym access by hand. The grant now lives in t42_gym_grant.
create or replace function public.t42_gym_enrol(p_registration uuid)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.t42_is_admin() then
    raise exception 'Only an admin can grant gym access' using errcode = 'insufficient_privilege';
  end if;
  return public.t42_gym_grant(p_registration, auth.uid());
end $$;

-- Fires once, on the move into paid (pay-callback, pay-status, or an admin
-- confirming a manual payment), and never undoes a grant: a refund is an
-- admin decision, not a trigger's.
create or replace function public.t42_gym_on_paid()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.mode = 'gym_duo'
     and new.status in ('paid','active')
     and coalesce(old.status,'') not in ('paid','active','completed') then
    begin
      perform public.t42_gym_grant(new.id, null);
    exception when others then
      raise warning 't42 gym access not granted for %: %', new.id, sqlerrm;
      begin
        insert into public.t42_admin_notes (challenge_id, registration_id, action, detail)
        values (new.challenge_id, new.id, 'gym_access_failed', left(sqlerrm, 300));
      exception when others then null;
      end;
    end;
  end if;
  return new;
end $$;

drop trigger if exists t42_gym_on_paid on public.t42_registrations;
create trigger t42_gym_on_paid
  after update of status on public.t42_registrations
  for each row execute function public.t42_gym_on_paid();

revoke all on function public.t42_gym_grant(uuid, uuid) from public, anon, authenticated;
revoke all on function public.t42_gym_on_paid()         from public, anon, authenticated;
revoke all on function public.t42_guard_mode()          from public, anon, authenticated;
revoke all    on function public.t42_gym_enrol(uuid)    from public, anon;
grant execute on function public.t42_gym_enrol(uuid)    to authenticated;


-- ═══════════════════════════════════════════════════════════════
--  4 · T42 NOVEMBER 2026 — ONLINE AND GYM DUO
--
--  The prices are NOT set here — they are a business decision:
--
--    update public.t42_challenges
--       set price_rm = <online RM>, gym_price_rm = <gym duo RM, per person>
--     where slug = 't42-nov-2026';
--
--  Gym Duo trains at HITFAT HQ and checks in through HITFAT Club, so
--  10-club-tables.sql, 11-club-checkin.sql and 26-t42-gym.sql must be live.
-- ═══════════════════════════════════════════════════════════════
update public.t42_challenges
   set config = config || jsonb_build_object('gym_enabled', true),
       updated_at = now()
 where slug = 't42-nov-2026';


-- ── check it landed ─────────────────────────────────────────────
--   select slug, price_rm, gym_price_rm, config->'gym_enabled' as gym
--     from public.t42_challenges;
