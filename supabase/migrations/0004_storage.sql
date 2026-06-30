-- Little Talkers — Storage buckets + RLS policies
-- Run AFTER 0002_rls.sql (it reuses public.assigned_patient() and public.can()).
-- Safe to re-run (buckets use ON CONFLICT; policies are dropped first).
--
-- Path conventions enforced by these policies:
--   avatars/<user_id>/<file>            -- a user may only write under their own uid folder
--   patient-files/<patient_id>/<file>   -- access derived from the patient's RLS rules
--
-- Both buckets are PRIVATE (public = false). Clients read via the user-scoped Supabase
-- session (supabase-js .download / .createSignedUrl) — RLS below authorizes each object.
-- The service_role key is NEVER needed on the client for this; keep it server-only.

-- ===========================================================================
-- Buckets
-- ===========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', false,
  5242880,                                              -- 5 MB
  array['image/png','image/jpeg','image/webp','image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'patient-files', 'patient-files', false,
  52428800,                                             -- 50 MB
  null                                                  -- any file type (reports, audio, docs…)
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ===========================================================================
-- Helper: first path segment (the owning folder) as text, or null
-- ===========================================================================
create or replace function public.storage_top_folder(object_name text)
returns text
language sql immutable
as $$ select (storage.foldername(object_name))[1] $$;

-- ===========================================================================
-- avatars — any signed-in user can VIEW; you may only manage your OWN folder.
-- RLS is already enabled on storage.objects by Supabase; we just add policies.
-- ===========================================================================
drop policy if exists avatars_read   on storage.objects;
drop policy if exists avatars_insert on storage.objects;
drop policy if exists avatars_update on storage.objects;
drop policy if exists avatars_delete on storage.objects;

-- Read: authenticated users only (private bucket — not world-readable)
create policy avatars_read on storage.objects for select
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
  );

-- Insert/Update/Delete: only inside your own "<uid>/…" folder
create policy avatars_insert on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and public.storage_top_folder(name) = auth.uid()::text
  );

create policy avatars_update on storage.objects for update
  using (
    bucket_id = 'avatars'
    and public.storage_top_folder(name) = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and public.storage_top_folder(name) = auth.uid()::text
  );

create policy avatars_delete on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and public.storage_top_folder(name) = auth.uid()::text
  );

-- ===========================================================================
-- patient-files — private. Access strictly mirrors the patient's table RLS:
--   READ  : anyone allowed to see the patient (assigned therapist / view_all / main / parent)
--   WRITE : a therapist who holds `manage_files` AND is authorized for that patient
-- The "<patient_id>" folder must be a uuid; the regex guard prevents cast errors.
-- ===========================================================================
drop policy if exists pfiles_read   on storage.objects;
drop policy if exists pfiles_insert on storage.objects;
drop policy if exists pfiles_update on storage.objects;
drop policy if exists pfiles_delete on storage.objects;

create policy pfiles_read on storage.objects for select
  using (
    bucket_id = 'patient-files'
    and public.storage_top_folder(name) ~ '^[0-9a-fA-F-]{36}$'
    and public.assigned_patient(public.storage_top_folder(name)::uuid)
  );

create policy pfiles_insert on storage.objects for insert
  with check (
    bucket_id = 'patient-files'
    and public.storage_top_folder(name) ~ '^[0-9a-fA-F-]{36}$'
    and public.can('manage_files')
    and public.assigned_patient(public.storage_top_folder(name)::uuid)
  );

create policy pfiles_update on storage.objects for update
  using (
    bucket_id = 'patient-files'
    and public.storage_top_folder(name) ~ '^[0-9a-fA-F-]{36}$'
    and public.can('manage_files')
    and public.assigned_patient(public.storage_top_folder(name)::uuid)
  )
  with check (
    bucket_id = 'patient-files'
    and public.storage_top_folder(name) ~ '^[0-9a-fA-F-]{36}$'
    and public.can('manage_files')
    and public.assigned_patient(public.storage_top_folder(name)::uuid)
  );

create policy pfiles_delete on storage.objects for delete
  using (
    bucket_id = 'patient-files'
    and public.storage_top_folder(name) ~ '^[0-9a-fA-F-]{36}$'
    and public.can('manage_files')
    and public.assigned_patient(public.storage_top_folder(name)::uuid)
  );
