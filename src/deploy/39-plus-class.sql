-- ═══════════════════════════════════════════════════════════════
--  HITFAT Class · the bridge key, on the HITFAT+ side
--  Run once in project ercvaagznsndvrewlvgt (HITFAT+), after 38-.
--
--  Physical class members (HITFAT OS, os.hitfat.io) get All Access in
--  HITFAT+ while their class membership runs. The edge function
--  plus-class asks HITFAT OS about them with a secret key.
--
--  The key is made here, by the database, and kept in plus_settings
--  (RLS on, no policies: service role only). It never leaves in the
--  clear: the query below prints only its sha256, which is all HITFAT OS
--  stores (sql/080_plus_bridge.sql in hitfat-membership-src). Then, in
--  the HITFAT OS project:
--
--    insert into plus_bridge (id, key_hash) values (1, '<hash>')
--    on conflict (id) do update set key_hash = excluded.key_hash, updated_at = now();
-- ═══════════════════════════════════════════════════════════════

-- Phone lookups, so one account cannot walk through phone numbers to see
-- who trains at the gym: plus-class allows 8 an hour per account.
create table if not exists public.plus_class_tries (
  user_id uuid not null,
  at      timestamptz not null default now()
);
create index if not exists plus_class_tries_user on public.plus_class_tries (user_id, at desc);
alter table public.plus_class_tries enable row level security;
revoke all on public.plus_class_tries from anon, authenticated;

insert into public.plus_settings (key, value)
values ('os_bridge_key', encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (key) do nothing;

select encode(extensions.digest(value, 'sha256'), 'hex') as hash_for_hitfat_os
  from public.plus_settings where key = 'os_bridge_key';
