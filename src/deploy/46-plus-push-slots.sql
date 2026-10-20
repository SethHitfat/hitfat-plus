-- ═══════════════════════════════════════════════════════════════
--  HITFAT+ · Bara's reminders four times a day (20 Oct 2026)
--  Safe to run again.
--
--  After Simple's reminders: 9 am (check in), 1 pm (log lunch), 8 pm (the
--  evening one, as before) and 10 pm (what is left to turn Bara red), each
--  only with a reason, at most 3 a day for a member (plus-push PUSH_MAX).
--  Each device row counts what it was sent today and which slots.
-- ═══════════════════════════════════════════════════════════════

alter table public.plus_push_subs add column if not exists sent_day   date;
alter table public.plus_push_subs add column if not exists sent_n     int not null default 0;
alter table public.plus_push_subs add column if not exists sent_slots text not null default '';

-- 01:00, 05:00 and 14:00 UTC = 9 am, 1 pm and 10 pm in Malaysia
do $$
declare j record;
begin
  for j in select * from (values ('plus-push-pagi','0 1 * * *','pagi'), ('plus-push-siang','0 5 * * *','siang'), ('plus-push-tidur','0 14 * * *','tidur')) as t(name, sched, slot) loop
    perform cron.unschedule(j.name) where exists (select 1 from cron.job where jobname = j.name);
    perform cron.schedule(j.name, j.sched, format($job$
      select net.http_post(
        url     := 'https://ercvaagznsndvrewlvgt.supabase.co/functions/v1/plus-push?action=send&slot=%s&key=' ||
                   (select value from public.plus_settings where key = 'push_cron_key'),
        headers := '{"Content-Type":"application/json"}'::jsonb,
        body    := '{}'::jsonb,
        timeout_milliseconds := 60000
      );
    $job$, j.slot));
  end loop;
end $$;
