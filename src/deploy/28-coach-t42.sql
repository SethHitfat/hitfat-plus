-- ═══════════════════════════════════════════════════════════════
--  HITFAT+ COACH · one T42 edition included
--  Run after 27-t42-engine.sql. Safe to run again.
--
--  A HITFAT+ Coach membership includes one T42 place per membership year.
--  The member signs up to the edition as anyone does (the baseline makes the
--  pending registration), then claims the place instead of paying. The
--  claim is checked here, not in the app: a live coach membership in
--  plus_entitlements (written only by the payment functions), a pending
--  registration of their own, and no other claimed place in the last year.
-- ═══════════════════════════════════════════════════════════════

do $order$
begin
  if to_regclass('public.plus_entitlements') is null
     or to_regprocedure('public.t42_is_paid_status(text)') is null then
    raise exception 'Run 01-plus-tables.sql and 20- to 27-t42-*.sql first.';
  end if;
end
$order$;

create or replace function public.t42_claim_with_coach(p_challenge uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_reg   public.t42_registrations%rowtype;
  v_until timestamptz;
  v_used  int;
begin
  if auth.uid() is null then
    raise exception 'Sign in first' using errcode = 'insufficient_privilege';
  end if;

  select max(expires_at) into v_until
    from public.plus_entitlements
   where user_id = auth.uid() and sku like 'sub_coach%' and expires_at > now();
  if v_until is null then
    raise exception 'A T42 place is included with HITFAT+ Coach' using errcode = 'check_violation';
  end if;

  select * into v_reg from public.t42_registrations
   where challenge_id = p_challenge and user_id = auth.uid();
  if not found then
    raise exception 'Finish your T42 sign-up first' using errcode = 'check_violation';
  end if;
  if public.t42_is_paid_status(v_reg.status) then return 'already'; end if;
  if v_reg.status <> 'pending' then
    raise exception 'This place cannot be claimed' using errcode = 'check_violation';
  end if;

  -- One included edition per membership year.
  select count(*) into v_used from public.t42_registrations
   where user_id = auth.uid() and product_sku = 'coach_included'
     and joined_at > now() - interval '365 days';
  if v_used > 0 then
    raise exception 'Your included T42 place has been used this year' using errcode = 'check_violation';
  end if;

  update public.t42_registrations
     set status = 'paid', product_sku = 'coach_included'
   where id = v_reg.id;
  return 'claimed';
end $$;

revoke all    on function public.t42_claim_with_coach(uuid) from public, anon;
grant execute on function public.t42_claim_with_coach(uuid) to authenticated;
