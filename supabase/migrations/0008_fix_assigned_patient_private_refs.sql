-- 0008: Hotfix for 0005. Moving the RLS helpers to the `private` schema left
-- assigned_patient() calling them as public.is_therapist()/is_main()/can(),
-- which no longer exist -> every write policy that evaluates assigned_patient
-- (notes, files, sessions, recordings) errored with "function does not exist".
-- Point the inner calls at private.*.
create or replace function private.assigned_patient(pid uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select exists (
    select 1 from public.patients p
    where p.id = pid
      and (
        p.parent_id = auth.uid()
        or (private.is_therapist() and (private.is_main() or private.can('view_all') or p.therapist_id = auth.uid()))
      )
  )
$function$;
