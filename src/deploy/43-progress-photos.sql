-- ═══════════════════════════════════════════════════════════════
--  Ladies: progress photos (17 Oct 2026)
--  Run in project ercvaagznsndvrewlvgt (HITFAT+).
--
--  A member's own before/after photos. Private: only the owner reads,
--  writes or removes them, in her own folder; the app opens them through
--  a signed link that lasts an hour. No coach, no admin, no OS. The app
--  sends a JPEG of 1280 px at most.
-- ═══════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('progress', 'progress', false, 3145728, array['image/jpeg'])
on conflict (id) do update set
  public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists progress_read_own on storage.objects;
create policy progress_read_own on storage.objects
  for select to authenticated using (
    bucket_id = 'progress' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists progress_write_own on storage.objects;
create policy progress_write_own on storage.objects
  for insert to authenticated with check (
    bucket_id = 'progress' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists progress_delete_own on storage.objects;
create policy progress_delete_own on storage.objects
  for delete to authenticated using (
    bucket_id = 'progress' and (storage.foldername(name))[1] = auth.uid()::text);
