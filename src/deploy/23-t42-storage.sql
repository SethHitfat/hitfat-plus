-- ═══════════════════════════════════════════════════════════════
--  T42 · progress photos
--  Run after 20-t42-core.sql.
--
--  These are the most sensitive rows the challenge holds. Someone in
--  their underwear on day one, photographed because an app asked them to,
--  trusting that it goes nowhere. So:
--
--    · the bucket is PRIVATE. There is no public URL, ever. The app reads
--      a photo through a signed link that expires in an hour.
--    · a member reaches their own folder and nothing else. Not their duo
--      partner's — training beside someone is not consent to see them
--      undressed.
--    · staff can read, because a final result may have to be verified
--      against a starting photo, and that is the whole point of taking
--      them. Staff cannot write or delete: a photo an admin could replace
--      is not evidence of anything.
--    · nobody can delete another person's photo, and a member can delete
--      their own. If someone wants their body out of this system, they
--      should not have to ask.
--
--  Path is  <user_id>/<phase>-<slot>.jpg  —  e.g.
--    3f9c…-a1/baseline-front.jpg
--  The first folder segment IS the owner, which is what every policy below
--  checks. t42_measurements stores this path, never a URL.
-- ═══════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  't42-photos', 't42-photos', false,
  8388608,                                   -- 8MB; a phone photo is 2–4
  array['image/jpeg','image/png','image/webp','image/heic']
)
on conflict (id) do update set
  public             = false,                -- never let this drift to true
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- ── who may read ────────────────────────────────────────────────
drop policy if exists t42_photos_read_own on storage.objects;
create policy t42_photos_read_own on storage.objects
  for select using (
    bucket_id = 't42-photos'
    and (
      -- the first path segment is the owner's user id
      (storage.foldername(name))[1] = auth.uid()::text
      or public.t42_is_staff()
    )
  );

-- ── who may write ───────────────────────────────────────────────
-- Only into your own folder, and only for a registration that is yours.
drop policy if exists t42_photos_write_own on storage.objects;
create policy t42_photos_write_own on storage.objects
  for insert with check (
    bucket_id = 't42-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Re-taking a photo replaces it. Same folder rule.
drop policy if exists t42_photos_update_own on storage.objects;
create policy t42_photos_update_own on storage.objects
  for update using (
    bucket_id = 't42-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 't42-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── who may delete ──────────────────────────────────────────────
-- The owner, and only the owner. Staff read to verify; they do not get to
-- remove someone's evidence, and they do not get to remove someone's body
-- from the system on that person's behalf.
drop policy if exists t42_photos_delete_own on storage.objects;
create policy t42_photos_delete_own on storage.objects
  for delete using (
    bucket_id = 't42-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
