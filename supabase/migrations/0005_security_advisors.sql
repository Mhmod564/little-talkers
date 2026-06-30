-- 0005: Resolve Supabase database linter security advisories.
--
-- Fixes (all were WARN-level SECURITY advisories):
--   * function_search_path_mutable            (set_updated_at, storage_top_folder)
--   * extension_in_public                     (citext)
--   * anon/authenticated_security_definer_*   (is_main, is_therapist, my_role,
--                                              can, assigned_patient, chat_participant)

-- 1) Pin search_path on the two flagged functions. Their bodies only use now()
--    (pg_catalog) and the schema-qualified storage.foldername(), so an empty
--    search_path is safe and removes the "role mutable search_path" warning.
alter function public.set_updated_at() set search_path = '';
alter function public.storage_top_folder(text) set search_path = '';

-- 2) Move the SECURITY DEFINER RLS-helper functions out of the API-exposed
--    public schema into a private schema, so they are no longer callable via
--    /rest/v1/rpc by anon or authenticated. RLS policies reference them by OID,
--    so policy evaluation is unaffected; they retain their search_path=public.
create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

alter function public.is_main() set schema private;
alter function public.is_therapist() set schema private;
alter function public.my_role() set schema private;
alter function public.can(text) set schema private;
alter function public.assigned_patient(uuid) set schema private;
alter function public.chat_participant(uuid) set schema private;

-- 3) Move the citext extension out of public into the standard extensions
--    schema (already on the database search_path, so unqualified citext
--    references still resolve and profiles.username keeps its type by OID).
alter extension citext set schema extensions;
