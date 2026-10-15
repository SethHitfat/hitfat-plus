-- ═══════════════════════════════════════════════════════════════
--  HITFAT+ · Bell's push reminders
--  Safe to run again.
--
--  A member who turns reminders on keeps a Web Push subscription here, one
--  row per device. Every evening at 8 pm Malaysia time pg_cron asks the
--  plus-push function to look at each member's day and, where Bell has
--  something to say (dusty, rusty, a streak at risk), send it. At most one
--  a day.
--
--  The VAPID keys and the cron key live in plus_settings (RLS on, no
--  policies: service role only). plus-push makes the VAPID keys itself on
--  first use, so the private key never leaves the server.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists pg_net with schema extensions;

create table if not exists public.plus_push_subs (
  endpoint   text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now(),
  last_sent  date,
  last_kind  text
);
create index if not exists plus_push_subs_user on public.plus_push_subs(user_id);
alter table public.plus_push_subs enable row level security;

drop policy if exists plus_push_subs_own_read on public.plus_push_subs;
create policy plus_push_subs_own_read on public.plus_push_subs
  for select using (auth.uid() = user_id);

-- Saving goes through these two, so a device that changes hands (another
-- member signs in on it) moves its subscription with it.
create or replace function public.plus_push_save(p_endpoint text, p_p256dh text, p_auth text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sign in'; end if;
  if coalesce(p_endpoint,'') !~ '^https://' or length(p_endpoint) > 1000 then raise exception 'bad endpoint'; end if;
  insert into plus_push_subs(endpoint, user_id, p256dh, auth)
  values (p_endpoint, auth.uid(), p_p256dh, p_auth)
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth;
end $$;

create or replace function public.plus_push_remove(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from plus_push_subs where endpoint = p_endpoint and user_id = auth.uid();
$$;

revoke all on function public.plus_push_save(text,text,text) from public, anon;
revoke all on function public.plus_push_remove(text) from public, anon;
grant execute on function public.plus_push_save(text,text,text) to authenticated;
grant execute on function public.plus_push_remove(text) to authenticated;

-- the key the evening job shows plus-push; made here, never typed anywhere
insert into public.plus_settings(key, value)
values ('push_cron_key', encode(extensions.gen_random_bytes(24), 'hex'))
on conflict (key) do nothing;

-- every day at 12:00 UTC = 8 pm in Malaysia
select cron.unschedule('plus-push-evening') where exists (select 1 from cron.job where jobname = 'plus-push-evening');
select cron.schedule('plus-push-evening', '0 12 * * *', $job$
  select net.http_post(
    url     := 'https://ercvaagznsndvrewlvgt.supabase.co/functions/v1/plus-push?action=send&key=' ||
               (select value from public.plus_settings where key = 'push_cron_key'),
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body    := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$job$);
