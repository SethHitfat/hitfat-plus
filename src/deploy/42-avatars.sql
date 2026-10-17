-- ═══════════════════════════════════════════════════════════════
--  Profile photos (17 Oct 2026)
--  Run in project ercvaagznsndvrewlvgt (HITFAT+).
--
--  The member's own photo for their profile, the leaderboard, posts and
--  comments. A public bucket, like a profile picture anywhere: the file
--  name is random and the folder is the owner's user id, nobody can list
--  the bucket, and only the owner writes or removes in their folder.
--  The app sends a 512 px square JPEG. A Google account's own picture is
--  used straight from Google and never copied here.
-- ═══════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/jpeg'])
on conflict (id) do update set
  public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists avatars_read_own on storage.objects;
create policy avatars_read_own on storage.objects
  for select to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists avatars_write_own on storage.objects;
create policy avatars_write_own on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists avatars_delete_own on storage.objects;
create policy avatars_delete_own on storage.objects
  for delete to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
