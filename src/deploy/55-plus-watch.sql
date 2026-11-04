-- ═══════════════════════════════════════════════════════════════
-- HITFAT+ · the watchdog's memory and its two schedules (4 Nov 2026)
--
-- Seth: "aturkan AI ... yang jaga". plus-watch (deploy/plus-watch) looks
-- for paid orders with no access, buyers stuck pending, and sites that
-- are down, and pushes to Seth's phone. plus_watch_seen remembers what it
-- has already said, so each alert comes once.
--
--   plus-watch-red    every 15 minutes
--   plus-watch-daily  01:00 UTC = 9 am Malaysia
-- Safe to run again.
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.plus_watch_seen (
  key text primary key,
  at  timestamptz not null default now()
);
alter table public.plus_watch_seen enable row level security;
revoke all on public.plus_watch_seen from anon, authenticated;

do $$
declare j record;
begin
  for j in select * from (values ('plus-watch-red', '*/15 * * * *', 'red'), ('plus-watch-daily', '0 1 * * *', 'daily')) as t(name, sched, mode) loop
    perform cron.unschedule(j.name) where exists (select 1 from cron.job where jobname = j.name);
    perform cron.schedule(j.name, j.sched, format($job$
      select net.http_post(
        url     := 'https://ercvaagznsndvrewlvgt.supabase.co/functions/v1/plus-watch?mode=%s&key=' ||
                   (select value from public.plus_settings where key = 'push_cron_key'),
        headers := '{"Content-Type":"application/json"}'::jsonb,
        body    := '{}'::jsonb,
        timeout_milliseconds := 60000
      );
    $job$, j.mode));
  end loop;
end $$;

select jobname, schedule from cron.job where jobname like 'plus-watch%';
