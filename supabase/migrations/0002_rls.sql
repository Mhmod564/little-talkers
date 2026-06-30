-- Little Talkers — Row Level Security (the core authorization rule)
-- Every table has RLS enabled; the frontend never decides access.
-- Helper functions are SECURITY DEFINER so policy checks don't recurse on profiles' own RLS.
-- Run this AFTER 0001_init_schema.sql. Safe to re-run (drops policies first).

-- ===========================================================================
-- Helper functions
-- ===========================================================================

-- Current user's role (null if not signed in / no profile)
create or replace function public.my_role()
returns user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

-- Is the current user the single main therapist?
create or replace function public.is_main()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce((select role = 'main_therapist' from public.profiles where id = auth.uid()), false) $$;

-- Is the current user any kind of therapist?
create or replace function public.is_therapist()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce((select role in ('main_therapist','therapist') from public.profiles where id = auth.uid()), false) $$;

-- Permission check: main always true; therapist if the jsonb flag is true; parent false.
create or replace function public.can(perm text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((
    select case
             when role = 'main_therapist' then true
             when role = 'therapist'      then coalesce((permissions ->> perm)::boolean, false)
             else false
           end
    from public.profiles where id = auth.uid()
  ), false)
$$;

-- Can the current user see this patient? Parent of the patient, or a therapist who is
-- assigned / has view_all / is main. (Used by child-table policies.)
create or replace function public.assigned_patient(pid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.patients p
    where p.id = pid
      and (
        p.parent_id = auth.uid()
        or (public.is_therapist() and (public.is_main() or public.can('view_all') or p.therapist_id = auth.uid()))
      )
  )
$$;

-- Is the current user a direct participant in this patient's chat?
-- (Assigned therapist OR the parent — NO view_all bypass for chat.)
create or replace function public.chat_participant(pid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.patients p
    where p.id = pid and (p.parent_id = auth.uid() or p.therapist_id = auth.uid())
  )
$$;

-- ===========================================================================
-- Enable RLS on every table
-- ===========================================================================
alter table public.profiles      enable row level security;
alter table public.login_codes   enable row level security;
alter table public.patients      enable row level security;
alter table public.notes         enable row level security;
alter table public.sessions      enable row level security;
alter table public.recordings    enable row level security;
alter table public.files         enable row level security;
alter table public.messages      enable row level security;
alter table public.activity_logs enable row level security;

-- ===========================================================================
-- profiles
-- ===========================================================================
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (
    id = auth.uid()                       -- own profile
    or public.is_therapist()              -- therapists see all profiles (doctors list, parents)
    or exists (                           -- parent sees the therapist assigned to their child
      select 1 from public.patients p
      where p.parent_id = auth.uid() and p.therapist_id = profiles.id
    )
  );

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert
  with check (public.is_main());          -- only main creates therapist/parent profiles

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid() or public.is_main())     -- self-edit, or main manages others
  with check (id = auth.uid() or public.is_main());

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles for delete
  using (public.is_main());

-- ===========================================================================
-- login_codes  — server-only (service_role). No client policies => clients denied.
-- ===========================================================================
-- (RLS enabled, intentionally no policies. The service_role key bypasses RLS.)

-- ===========================================================================
-- patients
-- ===========================================================================
drop policy if exists patients_select on public.patients;
create policy patients_select on public.patients for select
  using (
    parent_id = auth.uid()
    or (public.is_therapist() and (public.is_main() or public.can('view_all') or therapist_id = auth.uid()))
  );

drop policy if exists patients_insert on public.patients;
create policy patients_insert on public.patients for insert
  with check (public.can('manage_patients'));

drop policy if exists patients_update on public.patients;
create policy patients_update on public.patients for update
  using (public.can('manage_patients'))
  with check (public.can('manage_patients'));

drop policy if exists patients_delete on public.patients;
create policy patients_delete on public.patients for delete
  using (public.can('manage_patients'));

-- ===========================================================================
-- Child clinical tables: visibility via the patient; writes gated by manage_* flag.
-- ===========================================================================

-- notes
drop policy if exists notes_select on public.notes;
create policy notes_select on public.notes for select
  using (public.assigned_patient(patient_id));
drop policy if exists notes_write on public.notes;
create policy notes_write on public.notes for all
  using (public.can('manage_notes') and public.assigned_patient(patient_id))
  with check (public.can('manage_notes') and public.assigned_patient(patient_id));

-- sessions
drop policy if exists sessions_select on public.sessions;
create policy sessions_select on public.sessions for select
  using (public.assigned_patient(patient_id));
drop policy if exists sessions_write on public.sessions;
create policy sessions_write on public.sessions for all
  using (public.can('manage_sessions') and public.assigned_patient(patient_id))
  with check (public.can('manage_sessions') and public.assigned_patient(patient_id));

-- recordings
drop policy if exists recordings_select on public.recordings;
create policy recordings_select on public.recordings for select
  using (public.assigned_patient(patient_id));
drop policy if exists recordings_write on public.recordings;
create policy recordings_write on public.recordings for all
  using (public.can('manage_recordings') and public.assigned_patient(patient_id))
  with check (public.can('manage_recordings') and public.assigned_patient(patient_id));

-- files
drop policy if exists files_select on public.files;
create policy files_select on public.files for select
  using (public.assigned_patient(patient_id));
drop policy if exists files_write on public.files;
create policy files_write on public.files for all
  using (public.can('manage_files') and public.assigned_patient(patient_id))
  with check (public.can('manage_files') and public.assigned_patient(patient_id));

-- ===========================================================================
-- messages (chat) — private to the patient's parent + assigned therapist only.
-- No view_all bypass. Messages are never deleted (no delete policy).
-- ===========================================================================
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages for select
  using (public.chat_participant(patient_id));

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert
  with check (
    sender_id = auth.uid()
    and public.chat_participant(patient_id)
    -- a therapist must also hold the chat permission; parents may always message about their child
    and (
      exists (select 1 from public.patients p where p.id = patient_id and p.parent_id = auth.uid())
      or public.can('chat')
    )
  );

drop policy if exists messages_update on public.messages;          -- mark-as-read only
create policy messages_update on public.messages for update
  using (public.chat_participant(patient_id))
  with check (public.chat_participant(patient_id));

-- ===========================================================================
-- activity_logs — readable by therapists with view_log (main sees all);
-- inserted by the acting user; immutable (no update/delete).
-- ===========================================================================
drop policy if exists logs_select on public.activity_logs;
create policy logs_select on public.activity_logs for select
  using (public.can('view_log'));

drop policy if exists logs_insert on public.activity_logs;
create policy logs_insert on public.activity_logs for insert
  with check (actor_id = auth.uid() and public.is_therapist());
