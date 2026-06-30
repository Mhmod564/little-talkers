# Little Talkers — Rewrite Plan (Next.js + Supabase + TypeScript)

Goal: rebuild the current vanilla-JS/`localStorage` prototype as a production app that follows
`.claude/plan.md` (server-side logic, safe error handling, crash-proof frontend, strict TypeScript).

This document is for **review before any code is written**. Nothing here is built yet.

---

## 1. Target stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Server Actions = the "all logic on the server" rule; SSR; first-class TS |
| DB + Auth + Storage | **Supabase** (Postgres + Auth + Storage + RLS) | RLS enforces authorization in the DB, exactly as the rules require |
| Validation | **Zod** | Validate every Server Action input on the server |
| i18n | **next-intl** (or lightweight dict) with `[locale]` routing | he / ar / en, RTL/LTR per locale |
| Styling | Tailwind CSS (port the pastel design tokens) | Keep current look; utility-first, themeable (dark mode) |
| Hosting | **Vercel** (app) + Supabase (cloud) | GitHub Pages can't run a backend; Server Actions need a Node host |

The current static prototype stays at the GitHub Pages link as a reference until the rewrite ships.

---

## 2. Prerequisites the user must set up (one-time)

1. **Install Node.js LTS** (not currently installed on this machine) — needed for Next.js.
2. **Create a Supabase project** → get `Project URL`, `anon key`, `service_role key`.
3. **Create a Vercel account** (free tier is fine) for deployment — this is the chosen host.
4. **Set up transactional email** for the login verification code (see §4): either configure Supabase
   Auth's **custom SMTP**, or create a **Resend** account and add its API key. Needed before auth works.

---

## 3. Data model → Postgres schema

Files move from base64-in-DB to **Supabase Storage**. Soft-deletes use `deleted_at`.

```
profiles                      -- 1:1 with auth.users (therapists AND parents)
  id              uuid pk = auth.users.id
  role            user_role          -- enum: 'main_therapist' | 'therapist' | 'parent'
  full_name       text
  title           text               -- therapist only
  phone           text
  birth_date      date
  age             int
  bio             text               -- therapist "journey"
  avatar_url      text               -- Storage path
  permissions     jsonb              -- therapist flags (see below); null for parents
  is_active       boolean default true   -- soft delete (doctors/patients restore)
  created_at, updated_at timestamptz

patients
  id              uuid pk
  full_name       text
  gender          text
  birth_date      date
  age             int
  guardian_name   text
  phone           text
  diagnosis       text
  progress        int  check (0..100)
  last_session    date
  therapist_id    uuid fk profiles    -- assigned therapist
  parent_id       uuid fk profiles    -- the parent account (role='parent')
  plan            text                -- next therapy plan
  avatar_url      text
  deleted_at      timestamptz         -- soft delete + restore
  created_at, updated_at

notes        (id, patient_id fk, session_date date, body text, author_id fk profiles, created_at)
sessions     (id, patient_id fk, scheduled_at timestamptz, title text, summary text,
              status session_status default 'scheduled', created_at)   -- 'scheduled' | 'completed'
recordings   (id, patient_id fk, title text, recorded_on date, url text, created_at)
files        (id, patient_id fk, name text, size int, storage_path text,
              uploaded_by fk profiles, created_at)
messages     (id, patient_id fk, sender_role text, sender_id fk profiles,
              body text, read_at timestamptz, created_at)   -- chat
activity_logs(id, actor_id fk profiles, actor_name text, action_key text, kind text,
              patient_id uuid, meta jsonb, created_at)
```

**Therapist permissions (`profiles.permissions` jsonb):** `view_all, manage_patients,
manage_notes, manage_sessions, manage_files, manage_recordings, chat, view_reports, view_log`.

Indexes on FKs (`patients.therapist_id`, `*.patient_id`, `activity_logs.created_at`, etc.).

---

## 4. Auth design (DECIDED — username login + email verification code)

**Decision:** Users log in with **username + password**. Every account also has a real **email**,
collected when the account is created but **never shown to the user and never used as the login
identifier** — it exists only to receive a one-time **verification code**. So login is two steps:

1. **Username + password.** Server Action looks up the account's email by username (service-role,
   server-only), then verifies the password via Supabase `signInWithPassword({ email, password })`.
2. **Email code.** On success we generate a 6-digit code, store it **hashed** with a short expiry
   (`login_codes` table: `user_id, code_hash, expires_at, consumed_at, attempts`), email it to the
   account's address, and create the real session only after the user enters the matching code.

The email never appears in the UI (no "log in with email", no display). The username is the only
public identifier. `account_credentials`/`profiles` holds the `username` (unique, case-insensitive)
and we keep the Supabase Auth email private.

**Who creates accounts:** therapists **generate** the username, password, and email for parents
(and the main therapist generates them for other therapists) — there is no public sign-up. Generated
credentials are shown to the therapist once to hand off; the email is used only for the login code.

**New table / column:**
```
login_codes  (id, user_id fk auth.users, code_hash text, expires_at timestamptz,
              consumed_at timestamptz, attempts int default 0, created_at)
profiles.username        citext unique not null     -- public login id
```
Email is the account's real address (in `auth.users`), kept out of the UI.

Roles come from `profiles.role`. A DB trigger creates a `profiles` row on signup. Email delivery uses
the provider from §2 (Resend or Supabase SMTP). Rate-limit code requests and cap `attempts`.

---

## 5. Authorization — RLS policies (the core rule)

Every table has RLS **enabled**; the frontend never decides access. Helper SQL functions:
`is_main()`, `my_role()`, `can(perm text)`, `assigned_patient(pid)`.

- **patients:** SELECT if `parent_id = auth.uid()` OR (therapist AND (`view_all` OR `therapist_id = auth.uid()` OR `is_main()`)). INSERT/UPDATE/DELETE gated by `manage_patients`.
- **notes/sessions/files/recordings:** access via the patient's policy; writes gated by the matching `manage_*` flag.
- **messages (chat):** visible only to the patient's `parent_id` and its `therapist_id` (private per assigned therapist — matches current behavior). No `view_all` bypass for chat.
- **activity_logs:** SELECT for therapists with `view_log` (main sees all); INSERT from Server Actions only.
- **profiles:** read own; therapists read their patients' parent profiles; main reads/writes therapists.

Mutations also go through Server Actions that re-check permission + validate with Zod (defense in depth), so we satisfy "never trust the frontend" twice over.

---

## 6. Server Actions / error-handling contract

Every mutation is a Server Action shaped like:

```ts
"use server";
export async function updateProgress(input: unknown): Promise<ActionResult<Patient>> {
  try {
    const data = UpdateProgressSchema.parse(input);      // Zod
    const supabase = createServerActionClient();         // user-scoped (RLS applies)
    const { data: row, error } = await supabase.from("patients")
      .update({ progress: data.progress }).eq("id", data.patientId).select().single();
    if (error) throw error;
    await logActivity({ action_key: "progress.update", patient_id: data.patientId, kind: "progress" });
    revalidatePath(`/patients/${data.patientId}`);
    return { success: true, data: row };
  } catch (err) {
    console.error("[updateProgress]", err);              // raw error -> server log
    return { success: false, error: "An unexpected error occurred. Please try again later." };
  }
}
```

`type ActionResult<T> = { success: true; data: T } | { success: false; error: string }`.
No raw DB errors, schemas, or stack traces ever reach the UI.

---

## 7. Frontend crash-prevention conventions

- `?.` for all nested DB fields; `||`/`??` fallbacks (`patient?.full_name ?? "Unnamed"`).
- Server Components fetch data; pass typed props down. `loading.tsx` + `error.tsx` per route segment.
- Lists guard against empty/undefined: render an empty state, never `.map()` on `undefined`.
- Forms use `useActionState` and show the generic error string from `ActionResult`.

---

## 8. Project structure

```
/app
  /[locale]
    /(auth)/login
    /(therapist)/dashboard | patients | patients/[id] | sessions | recordings
                 | reports | log | doctors | removed | profile
    /(parent)/child | chat
    layout.tsx                 -- sets <html dir> from locale, theme
  /actions/*.ts                -- Server Actions (patients, notes, sessions, chat, doctors, ...)
/components/ui, /components/*   -- shared, typed components
/lib
  supabase/{client,server}.ts  -- browser + server clients
  auth.ts, permissions.ts, types.ts (generated via `supabase gen types`), zod-schemas.ts
/locales/{he,ar,en}.json
/supabase/migrations/*.sql     -- schema + RLS + functions + seed
middleware.ts                  -- auth gate + locale
```

---

## 9. Feature parity checklist (port everything)

Auth & roles (main/therapist/parent) · Patients CRUD · soft delete + restore + removed page ·
notes · sessions (upcoming/past by datetime, end-of-session summary popup, details modal) ·
recordings (video links) · files (Storage upload/download) · progress · next plan ·
granular permissions · doctors management (main, soft delete/restore) · activity log
(filters: doctor/kind/date-range/search) · two-way chat (private per assigned therapist,
24h reset, logged) · parent read-only + edit basics + photo + view-therapist-profile ·
therapist self-profile (bio/photo/phone/age) · i18n he/ar/en + RTL/LTR · dark mode ·
idle logout (5 min) · back-to-top · counts in top bar · responsive (mobile cards).

**Chat:** messages are **kept permanently** (no 24h delete). The full conversation history stays in
the `messages` table; no pg_cron cleanup. (If a "recent only" view is ever wanted, filter at query
time — but nothing is deleted.)

---

## 10. Phased delivery (each phase reviewable)

1. **Scaffold** — Next.js + TS + Tailwind + Supabase clients + env + `ActionResult`/Zod base.
2. **Schema & RLS** — migrations for all tables, enums, functions, policies, seed data.
3. **Auth** — login, role-aware middleware, profile bootstrap trigger.
4. **Patients** — list/detail/CRUD + soft delete/restore + the design system port.
5. **Clinical data** — notes, sessions (+summary flow), recordings, files (Storage), progress, plan.
6. **Access control** — permissions UI, doctors management, removed page.
7. **Comms & audit** — chat, activity log + filters.
8. **i18n + theming + polish** — locales, RTL/LTR, dark mode, responsive, idle logout.
9. **Deploy** — Vercel + Supabase, env wiring, smoke test.

---

## 11. Decisions (RESOLVED — ready for Phase 1)

1. **Auth:** ✅ **Username + password login with an email verification code.** Email is collected at
   account creation but never shown/used as the login id — only to send a one-time code. (§4)
2. **Hosting:** ✅ **Vercel** (app) + Supabase (cloud).
3. **Chat:** ✅ **Do not delete messages** — keep full history; no 24h reset. (§9)
4. **Parent onboarding:** ✅ **Therapist generates** username + password + email; the email is used
   only to deliver the verification code. (§4)
5. **Data migration:** ✅ **Start fresh** with seed data — no import of the prototype's demo records.

All open decisions are settled. Phase 1 (Scaffold) can begin once the §2 prerequisites — Node.js,
Supabase project, Vercel account, and the email/SMTP provider for login codes — are in place.
