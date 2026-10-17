-- ═══════════════════════════════════════════════════════════════
--  HITFAT Class · Group photos (17 Oct 2026)
--  Run in project ercvaagznsndvrewlvgt (HITFAT+).
--
--  Photos members post in their class group. Private: no policies, so
--  only the service role (plus-class) reads and writes, and the app sees a
--  photo through a signed link that lasts an hour, and only after HITFAT OS
--  has said the post is in the member's own group (Ladies Only stays among
--  women). plus-class shrinks nothing; the app sends ~1280 px JPEG.
-- ═══════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cm-photos', 'cm-photos', false, 4194304, array['image/jpeg'])
on conflict (id) do update set
  public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
