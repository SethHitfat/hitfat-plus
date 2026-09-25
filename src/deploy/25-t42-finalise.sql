-- ═══════════════════════════════════════════════════════════════
--  T42 · closing an edition
--  Run after 24-t42-scoring.sql.
--
--  One function, t42_finalise(), pressed once by an admin after the last
--  day. In a single transaction it:
--
--    1 · moves the edition to 'assessment' and scores it as final
--    2 · REFUSES to go on if anyone on a podium has a final nobody has
--        checked — the brief's rule that top finishers are verified, made
--        into something that cannot be skipped
--    3 · marks the edition 'complete' and its finishers 'completed'
--    4 · issues the certificates
--
--  If step 2 refuses, nothing has happened: the status change and the
--  scores roll back with it. Pressing it again is safe — certificates are
--  unique per person per kind and are never re-issued or rewritten.
--
--  Certificates are written here and nowhere else. t42_certificates has no
--  insert policy at all: a certificate a browser could write would say
--  CHAMPION on whoever asked.
-- ═══════════════════════════════════════════════════════════════

-- The name on a certificate is the member's full name — it is theirs, and
-- they are the one who shares it. Frozen at issue, so renaming a profile
-- later does not quietly change a certificate that has already been posted.
create or replace function public.t42_full_name(p_user uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(
           nullif(trim(coalesce(u.raw_user_meta_data ->> 'name',
                                u.raw_user_meta_data ->> 'full_name', '')), ''),
           'T42 Participant')
    from auth.users u where u.id = p_user;
$$;


create or replace function public.t42_finalise(p_challenge uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  ch       public.t42_challenges%rowtype;
  v_real   int;
  v_scored int;
  v_certs  int;
  v_done   int;
  v_bad    text;
  v_prefix text;
begin
  if not public.t42_is_admin() then
    raise exception 'Only an admin can finalise T42' using errcode = 'insufficient_privilege';
  end if;
  select * into ch from public.t42_challenges where id = p_challenge;
  if not found then raise exception 'No T42 challenge %', p_challenge; end if;

  -- Not before the last day. Results announced on day 40 are results
  -- someone still had two days to change.
  v_real := current_date - ch.starts_on + 1;
  if v_real < ch.total_days then
    raise exception 'T42 runs until day %; today is day %', ch.total_days, greatest(v_real, 0);
  end if;

  -- 1 · score it as final
  if ch.status <> 'complete' then
    update public.t42_challenges set status = 'assessment', updated_at = now() where id = ch.id;
  end if;
  v_scored := public.t42_compute_scores(ch.id);

  -- 2 · nobody on a podium with an unchecked final
  select string_agg(public.t42_full_name(r.user_id) || ' (' ||
                    coalesce(replace(s.category, '_', ' '), 'unplaced') || ')', ', ')
    into v_bad
    from public.t42_scores s
    join public.t42_registrations r on r.id = s.registration_id
    left join public.t42_measurements fn on fn.registration_id = r.id and fn.phase = 'final'
   where s.challenge_id = ch.id
     and s.eligible
     and (s.rank_category <= 3 or s.rank_consistency <= 3)
     and coalesce(fn.verify_status, 'none') <> 'verified';
  if v_bad is not null then
    raise exception 'Verify these finals before finalising: %', v_bad using errcode = 'check_violation';
  end if;

  -- 3 · closed
  update public.t42_challenges set status = 'complete', updated_at = now() where id = ch.id;
  update public.t42_registrations r
     set status = 'completed', completed_at = coalesce(r.completed_at, now())
    from public.t42_scores s
   where s.registration_id = r.id and s.challenge_id = ch.id and s.eligible
     and r.status not in ('withdrawn','disqualified');
  get diagnostics v_done = row_count;

  -- 4 · certificates
  -- FINISHER for everyone who completed it. A champion's certificate for
  -- first place on each board — two people tied on first both get one.
  v_prefix := 'T42-' || to_char(ch.starts_on, 'YYMM') || '-';
  insert into public.t42_certificates
    (registration_id, kind, participant_name, edition, final_score, issued_on, serial)
  select x.reg_id, x.kind, public.t42_full_name(r.user_id), coalesce(ch.edition, ch.name),
         x.score, current_date,
         v_prefix || upper(substr(md5(x.reg_id::text || x.kind), 1, 8))
    from (
      select s.registration_id as reg_id, 'finisher' as kind,
             case when s.category = 'consistency' then s.consistency_total else s.total end as score
        from public.t42_scores s
       where s.challenge_id = ch.id and s.eligible
      union all
      select s.registration_id,
             case when s.category like 'transform%' or s.category like 'gym_transform%'
                  then 'transformation_champion' else 'performance_champion' end,
             s.total
        from public.t42_scores s
       where s.challenge_id = ch.id and s.eligible and s.rank_category = 1
         and s.category <> 'consistency'
      union all
      select s.registration_id, 'consistency_champion', s.consistency_total
        from public.t42_scores s
       where s.challenge_id = ch.id and s.eligible and s.rank_consistency = 1
      union all
      select r2.id, 'duo_champion', d.team_total
        from public.t42_duo_scores d
        join public.t42_registrations r2 on r2.duo_id = d.duo_id
       where d.challenge_id = ch.id and d.eligible and d.rank_category = 1
    ) x
    join public.t42_registrations r on r.id = x.reg_id
  on conflict (registration_id, kind) do nothing;
  get diagnostics v_certs = row_count;

  insert into public.t42_admin_notes (challenge_id, action, detail, acted_by)
  values (ch.id, 'finalise',
          v_scored || ' scored, ' || v_done || ' completed, ' || v_certs || ' certificates issued',
          auth.uid());

  return jsonb_build_object('scored', v_scored, 'completed', v_done, 'certificates', v_certs);
end $$;

revoke all on function public.t42_full_name(uuid)  from public, anon, authenticated;
revoke all on function public.t42_finalise(uuid)   from public, anon;
grant execute on function public.t42_finalise(uuid) to authenticated;
