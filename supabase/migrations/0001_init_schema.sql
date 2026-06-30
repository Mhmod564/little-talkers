-- Little Talkers — initial schema
-- Postgres / Supabase. Run order: this file first, then RLS policies (0002), then seed (0003).
-- Keep it simple: tables, enums, indexes, and updated_at triggers. RLS lives in its own migration.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid(), digest()
create extension if not exists "citext";      -- case-insensitive username

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role     as enum ('main_therapist', 'therapist', 'parent');
create type session_status as enum ('scheduled', 'completed');

-- ---------------------------------------------------------------------------
-- Helper: keep updated_at fresh on UPDATE
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles — 1:1 with auth.users (therapists AND parents)
-- ---------------------------------------------------------------------------
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     citext unique not null,          -- public login id (email stays private in auth.users)
  role         user_role not null,
  full_name    text not null,
  title        text,                            -- therapist only
  phone        text,
  birth_date   date,
  age          int,
  bio          text,                            -- therapist "journey"
  avatar_url   text,                            -- Storage path
  permissions  jsonb,                           -- therapist flags; null for parents
  is_active    boolean not null default true,   -- soft delete / restore
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- login_codes — one-time email verification codes (login step 2)
-- ---------------------------------------------------------------------------
create table login_codes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  code_hash    text not null,                   -- never store the raw code
  expires_at   timestamptz not null,
  consumed_at  timestamptz,
  attempts     int not null default 0,
  created_at   timestamptz not null default now()
);

create index idx_login_codes_user on login_codes(user_id);
create index idx_login_codes_expires on login_codes(expires_at);

-- ---------------------------------------------------------------------------
-- patients
-- ---------------------------------------------------------------------------
create table patients (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  gender        text,
  birth_date    date,
  age           int,
  guardian_name text,
  phone         text,
  diagnosis     text,
  progress      int check (progress between 0 and 100) default 0,
  last_session  date,
  therapist_id  uuid references profiles(id) on delete set null,   -- assigned therapist
  parent_id     uuid references profiles(id) on delete set null,   -- the parent account
  plan          text,                                              -- next therapy plan
  avatar_url    text,
  deleted_at    timestamptz,                                       -- soft delete / restore
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger patients_set_updated_at
  before update on patients
  for each row execute function set_updated_at();

create index idx_patients_therapist on patients(therapist_id);
create index idx_patients_parent on patients(parent_id);

-- ---------------------------------------------------------------------------
-- notes
-- ---------------------------------------------------------------------------
create table notes (
  id           uuid primary key default gen_random_uuid(),
  patient_id   uuid not null references patients(id) on delete cascade,
  session_date date,
  body         text not null,
  author_id    uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index idx_notes_patient on notes(patient_id);

-- ---------------------------------------------------------------------------
-- sessions — upcoming / past appointments
-- ---------------------------------------------------------------------------
create table sessions (
  id           uuid primary key default gen_random_uuid(),
  patient_id   uuid not null references patients(id) on delete cascade,
  scheduled_at timestamptz not null,
  title        text,
  summary      text,                              -- end-of-session summary
  status       session_status not null default 'scheduled',
  created_at   timestamptz not null default now()
);

create index idx_sessions_patient on sessions(patient_id);
create index idx_sessions_scheduled on sessions(scheduled_at);

-- ---------------------------------------------------------------------------
-- recordings — video links
-- ---------------------------------------------------------------------------
create table recordings (
  id           uuid primary key default gen_random_uuid(),
  patient_id   uuid not null references patients(id) on delete cascade,
  title        text,
  recorded_on  date,
  url          text not null,
  created_at   timestamptz not null default now()
);

create index idx_recordings_patient on recordings(patient_id);

-- ---------------------------------------------------------------------------
-- files — Supabase Storage references
-- ---------------------------------------------------------------------------
create table files (
  id           uuid primary key default gen_random_uuid(),
  patient_id   uuid not null references patients(id) on delete cascade,
  name         text not null,
  size         int,
  storage_path text not null,
  uploaded_by  uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index idx_files_patient on files(patient_id);

-- ---------------------------------------------------------------------------
-- messages — two-way chat (kept permanently, no 24h reset)
-- ---------------------------------------------------------------------------
create table messages (
  id           uuid primary key default gen_random_uuid(),
  patient_id   uuid not null references patients(id) on delete cascade,
  sender_role  text not null,                     -- 'therapist' | 'parent'
  sender_id    uuid references profiles(id) on delete set null,
  body         text not null,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index idx_messages_patient on messages(patient_id);
create index idx_messages_created on messages(created_at);

-- ---------------------------------------------------------------------------
-- activity_logs — audit trail (inserted from Server Actions only)
-- ---------------------------------------------------------------------------
create table activity_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references profiles(id) on delete set null,
  actor_name   text,
  action_key   text not null,
  kind         text,                              -- note|progress|plan|file|patient|remove|session|doctor|message|info
  patient_id   uuid,
  meta         jsonb,
  created_at   timestamptz not null default now()
);

create index idx_logs_created on activity_logs(created_at);
create index idx_logs_actor on activity_logs(actor_id);
create index idx_logs_patient on activity_logs(patient_id);
