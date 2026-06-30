-- Little Talkers — fresh demo seed (one therapist + one patient).
-- The therapist's auth.users row is created out-of-band via the Auth Admin API
-- (email: sara.therapist@example.com). This script links the profile to it by email,
-- so it is safe to re-run.

do $$
declare
  tid uuid;
begin
  select id into tid from auth.users where email = 'sara.therapist@example.com';
  if tid is null then
    raise notice 'therapist auth user not found — create it via the Auth Admin API first';
    return;
  end if;

  -- Therapist profile (main therapist = full permissions)
  insert into profiles (id, username, role, full_name, title, phone, permissions)
  values (
    tid, 'dr.sara', 'main_therapist', 'د. سارة عبدالله', 'أخصائية نطق ولغة', '0500000000',
    jsonb_build_object(
      'view_all', true, 'manage_patients', true, 'manage_notes', true,
      'manage_sessions', true, 'manage_files', true, 'manage_recordings', true,
      'chat', true, 'view_reports', true, 'view_log', true
    )
  )
  on conflict (id) do update set
    username    = excluded.username,
    role        = excluded.role,
    full_name   = excluded.full_name,
    title       = excluded.title,
    phone       = excluded.phone,
    permissions = excluded.permissions;

  -- Demo patient, assigned to the therapist
  insert into patients (full_name, gender, age, guardian_name, phone, diagnosis, progress, therapist_id)
  select 'يوسف أحمد', 'male', 6, 'أحمد يوسف', '0501111111', 'تأخر لغوي', 35, tid
  where not exists (select 1 from patients where full_name = 'يوسف أحمد');
end $$;
