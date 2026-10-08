-- ═══════════════════════════════════════════════════════════════
--  T42 · WHICH MODES AN EDITION RUNS
--  Run after 29-t42-purchases.sql. Safe to run again.
--
--  T42 November 2026 is physical only: Gym Duo at HITFAT HQ, in pairs.
--  Online Solo stays built and is switched off per edition with
--  config.online_enabled = false; Gym Duo is switched on with
--  config.gym_enabled = true. The app reads both to decide what it offers,
--  and the trigger below holds the line for anyone who writes a
--  registration directly.
-- ═══════════════════════════════════════════════════════════════

do $order$
begin
  if to_regprocedure('public.t42_claim_purchase(uuid,text)') is null then
    raise exception 'Run 20- to 29-*.sql first.';
  end if;
end
$order$;

create or replace function public.t42_mode_allowed(p_challenge uuid, p_mode text)
returns boolean language sql stable security definer set search_path = public as $$
  select case p_mode
           when 'gym_duo'     then coalesce((c.config->>'gym_enabled')::boolean, false)
           when 'online_solo' then coalesce((c.config->>'online_enabled')::boolean, true)
           else false
         end
    from public.t42_challenges c where c.id = p_challenge;
$$;

-- A new registration, or a member changing their own mode, must pick one
-- the edition runs. Staff may still move someone (t42_is_staff), so a
-- registration already in a mode the edition has since closed can be fixed.
create or replace function public.t42_guard_mode()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and new.mode is not distinct from old.mode then return new; end if;
  if public.t42_is_staff() then return new; end if;
  if not coalesce(public.t42_mode_allowed(new.challenge_id, new.mode), false) then
    raise exception 'This T42 edition does not run that mode' using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists t42_guard_mode on public.t42_registrations;
create trigger t42_guard_mode
  before insert or update of mode on public.t42_registrations
  for each row execute function public.t42_guard_mode();

-- November 2026: Gym Duo only.
update public.t42_challenges
   set config = config || jsonb_build_object('gym_enabled', true, 'online_enabled', false)
 where slug = 't42-nov-2026';
