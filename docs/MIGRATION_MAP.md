# Prototype → Next.js Migration Map

The vanilla prototype (`index.html`, `app.js` = 1895 lines, `styles.css` = 1077 lines) is the
**source of truth for UI/UX**. This document maps every part of it to the Next.js architecture
**before** code is written. Nothing here is built yet.

---

## 0. Key facts discovered (read these first)

- **Trilingual, Hebrew-default.** `<html lang="he" dir="rtl">`. Languages = `he` (default), `ar`, `en`
  (en = LTR). One big dictionary `S` (~230 keys × 3). Fonts = **Rubik + Cairo** (not Tajawal).
- **Two roles, instant login.** Role toggle (therapist/parent) + username/password, no email step.
  Demo: `doctor/1234`, parent `ahmad/1234`.
- **localStorage schema v3.** Per-patient nested `notes / sessions / recordings / files / chat`;
  doctors carry `permissions{9} / bio / phone / age / avatar / removed`.
- **Dark mode, idle auto-logout (5 min), back-to-top, language switcher, toasts, full modal system.**
- **9 permissions** (camelCase): `viewAll, managePatients, manageNotes, manageSessions, manageFiles,
  manageRecordings, chat, viewReports, viewLog`.

> ⚠️ These differ from the Phase-1 scaffold I already wrote (which assumed **Arabic-only + Tajawal +
> email-code login**). Section 7 lists every conflict and what I recommend. **Read §7 before we code.**

---

## 1. Target folder structure

```
app/
  layout.tsx                      root: <html dir/lang> from locale, providers, fonts (Rubik+Cairo)
  globals.css                     ← ported verbatim from styles.css (the design system)
  (auth)/
    login/page.tsx                LoginView (split hero + role segcomented + 2-step code)
  (therapist)/
    layout.tsx                    TherapistShell = Sidebar + Topbar + content
    dashboard/page.tsx            DashboardView (stat cards + compact patients + tip)
    patients/page.tsx             PatientsView (toolbar + table/cards)
    patients/[id]/page.tsx        ProfileView(editable)
    sessions/page.tsx             SessionsView (upcoming + past)
    recordings/page.tsx           RecordingsView (grouped)
    reports/page.tsx              ReportsView (grouped files)
    log/page.tsx                  LogView (filters + date range)
    doctors/page.tsx              DoctorsView (main only) + removed doctors
    removed/page.tsx              RemovedView (soft-deleted patients)
    profile/page.tsx              MyProfileView (journey/bio/photo)
  (parent)/
    layout.tsx                    ParentShell (read-only chrome)
    child/page.tsx                ProfileView(readonly=true)
    chat/page.tsx                 (or modal) parent⇄therapist chat
  actions/                        "use server" — one file per domain (see §4)
    auth.ts patients.ts notes.ts sessions.ts recordings.ts files.ts
    progress.ts plan.ts doctors.ts chat.ts profile.ts log.ts

components/
  icons.tsx                       the `I` SVG map → exported React components / record
  ui/                             Card, Modal, ConfirmDialog, Toast, Button, Field, Select,
                                  Avatar(+editable), ProgressRing, Tag, EmptyState, Toolbar, Badge
  layout/                         Shell, Sidebar, Topbar, LangSwitcher, ThemeToggle, BackToTop
  patients/                       PatientsTable, PatientFilters, PatientProfile, InfoGrid, NotesTimeline
  sessions/                       SessionList, SessionItem, DateChip
  recordings/ reports/ log/ doctors/ chat/   section pieces
  modals/                         PatientModal, NoteModal, ProgressModal, PlanModal, SessionModal,
                                  SessionDetailsModal, SessionSummaryModal, RecordingModal,
                                  UploadModal, DoctorModal, MyProfileModal, DoctorProfileModal,
                                  ParentEditModal, InboxModal, ChatModal

providers/                        I18nProvider, ThemeProvider, ToastProvider, SessionProvider
hooks/                            useIdleLogout, useBackToTop, useDisclosure (modal), useFilters

lib/
  i18n/{langs.ts, dictionary.ts, t.ts}     LANGS, S, t()/ti()/loc()
  permissions.ts                  ALL_PERMS, PERM_KEY, can()
  format.ts                       esc(unneeded in JSX), initials, avaClass, fmt*, gender, session* helpers
  supabase/{client,server,admin,middleware}.ts   (exist)
  types.ts                        (exists; extend with Note/Session/Recording/FileRow/Message/Log)
  zod-schemas.ts                  per-action input schemas
```

---

## 2. `app.js` → React, region by region

| `app.js` region (lines) | What it is | New home |
|---|---|---|
| `I` icon set (13–61) | SVG strings | `components/icons.tsx` (typed `Record<string, JSX>`), reused everywhere |
| `LANGS`, `S`, `t/ti/loc`, `applyLangAttrs`, `setLang` (66–422) | i18n | `lib/i18n/*` + `I18nProvider`; locale also drives `app/[no-]layout` `dir/lang` |
| `LangSwitcher`, `bindLangSwitch` (424–447) | language menu | `components/layout/LangSwitcher.tsx` |
| dark mode `applyTheme/toggleTheme/ThemeBtn` (449–455) | theme | `ThemeProvider` + `components/layout/ThemeToggle.tsx` (class on `<html>`, persisted) |
| `goHome` (457) | nav reset | router push to dashboard/child |
| Utilities `esc/uid/initials/avaClass/today/session*` (463–494) | helpers | `lib/format.ts` (drop `esc` — JSX auto-escapes; `uid` → DB/`crypto.randomUUID`) |
| Data store `seed/loadDB/saveDB/normalize/pruneChats` (496–590) | localStorage | **replaced** by Supabase + `supabase/migrations` seed (see §3) |
| accessors `getPatient/getDoctor/currentDoctor/can/visiblePatients/...` (592–614) | reads + authz | Server Components query Supabase (RLS); `can()` → `lib/permissions.ts` |
| `freshState`, idle, `toast`, `render` (616–656) | app state + root render | React routing + providers; `render()` disappears (no manual DOM) |
| `LoginView`/`afterLogin` (661–725) | login | `(auth)/login/page.tsx` + `actions/auth.ts` (keep visual, add code step) |
| `TherapistShell/Sidebar/Topbar/routeCount` (730–795) | chrome | `(therapist)/layout.tsx` + `components/layout/*` |
| `DashboardView` (836–858) | dashboard | `(therapist)/dashboard/page.tsx` |
| `applyFilters/PatientsView` (863–936) | list + filters | `patients/page.tsx` + `PatientsTable` + `PatientFilters` (filters in URL search params) |
| `sectionFilterBar` (941–956) | generic filter bar | `components/ui/Toolbar.tsx` + `SectionFilters` |
| `allSessions/SessionsView` (961–995) | sessions | `sessions/page.tsx` + `SessionList` |
| `RecordingsView/recordingItem` (1000–1028) | recordings | `recordings/page.tsx` |
| `ReportsView` (1033–1055) | files overview | `reports/page.tsx` |
| `LogView` (1060–1084) | activity log | `log/page.tsx` |
| `DoctorsView` (1089–1133) | doctors (main) | `doctors/page.tsx` |
| `RemovedView` (1138–1155) | soft-deleted | `removed/page.tsx` |
| `MyProfileView/openMyProfileModal/openDoctorProfileModal` (1160–1216) | therapist profile | `profile/page.tsx` + `MyProfileModal` + `DoctorProfileModal` |
| `bindAvatarUploads` (1218–1240) | photo upload | `Avatar` editable + `actions/profile.ts` → Storage `avatars/<uid>/…` |
| `ProfileView` (1245–1387) | patient file | `components/patients/PatientProfile.tsx` (shared by therapist + parent via `readonly`) |
| `bindContent/bindDownloads/downloadFile` (1392–1462) | event wiring | replaced by React handlers; downloads → Storage signed URLs |
| `openModal/ctl/confirmDialog` (1467–1491) | modal system | `components/ui/Modal.tsx` + `ConfirmDialog.tsx` + `useDisclosure` |
| patient/note/progress/plan/session/recording/upload/doctor modals (1493–1751) | CRUD modals | `components/modals/*` each calling a Server Action |
| session details + summary + `maybePromptSessionSummary` (1607–1667) | end-of-session flow | `SessionDetailsModal` + `SessionSummaryModal`; auto-prompt via effect in therapist layout |
| `openInboxModal/openChatModal` (1756–1805) | chat | `InboxModal` + `ChatModal`; realtime via Supabase Realtime (optional) or poll |
| `ParentShell/afterParent/openParentEditModal` (1810–1868) | parent app | `(parent)/*` |
| Boot + back-to-top + idle + `LittleTalkersReset` (1873–1895) | init | providers/hooks; reset → a dev-only re-seed script, not a global |

---

## 3. Data model reconciliation (prototype v3 ↔ Supabase)

| Prototype (localStorage) | Supabase table.column | Notes / transform |
|---|---|---|
| `doctor.id/username/password` | `profiles.id` + `auth.users` | password → Supabase Auth; username stays in `profiles.username` |
| `doctor.name/title/bio/phone/age/avatar` | `profiles.full_name/title/bio/phone/age/avatar_url` | avatar base64 → Storage path |
| `doctor.role "main"\|"doctor"` | `profiles.role 'main_therapist'\|'therapist'` | enum rename |
| `doctor.permissions{camelCase}` | `profiles.permissions jsonb{snake_case}` | **key map** `viewAll→view_all`, `managePatients→manage_patients`, … (helper in `lib/permissions.ts`) |
| `doctor.removed/removedAt` | `profiles.is_active` (+ `updated_at`) | `removed=true` ⇒ `is_active=false`; add `removed_at` column if we want the date shown |
| `patient.*` core fields | `patients.*` | `gender "זכר"/"נקבה"` ⇒ store `'male'/'female'`, translate in UI |
| `patient.parentUsername/parentPassword` | parent **auth user** + `patients.parent_id` | biggest change — parents become real accounts (§7.3) |
| `patient.notes[]` | `notes` table | |
| `patient.sessions[] (date,time,title,summary)` | `sessions (scheduled_at, title, summary, status)` | combine `date`+`time`→`scheduled_at`; `status` computed → store `'scheduled'/'completed'`; "pending" = past & no summary |
| `patient.recordings[]` | `recordings` table | |
| `patient.files[] (base64 data)` | `files` + Storage `patient-files/<patient_id>/…` | |
| `patient.chat[] (from,senderName,read,ts)` | `messages (sender_role, sender_id, body, read_at, created_at)` | 24h prune → see §7.2 |
| `patient.removed/removedAt` | `patients.deleted_at` | |
| `DB.logs[]` | `activity_logs` | `kind` includes `perms` (add to allowed kinds) |

Schema gaps to patch in a new migration `0005_parity.sql`: add `profiles.removed_at`,
`activity_logs` `kind='perms'` already free-form (ok), confirm `sessions.status` default.

---

## 4. Server Actions (replace every mutation, RLS-enforced, `ActionResult` contract)

`patients`: create/update/softDelete/restore/deleteForever · `notes`: add/delete ·
`progress`: update · `plan`: update · `sessions`: add/update/delete/writeSummary ·
`recordings`: add/delete (+ watch-log for parent) · `files`: upload(Storage)/delete/signedUrl ·
`doctors`: create/update(+perms)/softDelete/restore/deleteForever · `profile`: updateSelf/uploadAvatar ·
`chat`: send/markRead · `auth`: requestLoginCode/verifyLoginCode/signOut (built) · every action calls
`logActivity(...)` mirroring the old `logEvent`.

---

## 5. Styles strategy (pixel parity, no redesign)

- **Port `styles.css` verbatim** into `app/globals.css` (≈1077 lines). Keep **every class name** so
  React components emit the same markup classes → guaranteed visual parity. Tokens in `:root`
  (lavender `#7c6fd6`, blue `#8fb8f0`, green `#86d3a8`, amber `#f3c08a`, radii, shadows, `--sidebar-w`)
  and `.dark` overrides come across unchanged, plus all `@media` breakpoints (1100/1024/880/768/640/620/480).
- **CSS Modules: not used for the port** — renaming classes would risk parity. New, app-only components
  may use Modules/Tailwind, but the design system = the ported global CSS.
- Update `tailwind.config.ts` tokens to the **exact** prototype palette so any Tailwind usage matches.
- Fonts: load **Rubik + Cairo** via `next/font/google` (replace Tajawal); `:lang(ar)` rule retained.

---

## 6. Cross-cutting behaviors → React

| Behavior | Implementation |
|---|---|
| i18n + `dir/lang` switch | `I18nProvider` (context) + locale persisted; `<html>` attrs set in layout |
| Dark mode | `ThemeProvider`, `class="dark"` on `<html>`, `localStorage`, no-flash inline script |
| Toasts | `ToastProvider` + `useToast()` (port `.toast` markup) |
| Modals | `Modal` portal to `#modal-root` equivalent + `useDisclosure`; Esc/scrim close preserved |
| Search focus retention | native in React (controlled input keeps focus; no re-mount) |
| Idle logout (5 min) | `useIdleLogout` hook (listeners → signOut + redirect, idle banner on login) |
| Back-to-top | `useBackToTop` / `BackToTop` (show after 300px) |
| Avatar/file upload | client reads file → Server Action uploads to Storage (2MB avatars / size cap for files) |
| Downloads | Storage `createSignedUrl` (replaces base64 blob trick) |
| Activity prompt (session summary) | effect in therapist layout, replaces `maybePromptSessionSummary` |

---

## 7. Conflicts — RESOLVED (2026-06-28)

1. **Default language & fonts.** ✅ **Match the prototype exactly:** Hebrew default, full he/ar/en
   switcher, **Rubik + Cairo** fonts, en=LTR.
2. **Chat 24h reset.** ✅ **Keep messages forever** — drop `pruneChats`; history stays (also logged).
3. **Parent accounts.** ✅ Parents become real auth users; **same 2-step email-code login** as
   therapists. Adding a patient provisions the parent account (username + password + email).
4. **Login screen.** ✅ Port the split-hero + role-segmented visual; add the email-code step.
5. **base64 → Storage.** ✅ Avatars/files use the `avatars` / `patient-files` buckets; behavior identical.

Everything maps cleanly to **full feature parity** (every old function has a home in §2/§4).

---

## 8. Suggested build order (each phase reviewable)

1. **Foundation:** port `globals.css`, fonts, `icons.tsx`, i18n (`S` dict + provider), Theme/Toast/Session
   providers, `Shell/Sidebar/Topbar/LangSwitcher/ThemeToggle/BackToTop`.
2. **Login + parent provisioning** (visual port + code step).
3. **Patients:** list/filters/table+cards, `PatientProfile`, patient CRUD modals.
4. **Clinical:** notes, sessions (+details/summary flow), recordings, files (Storage), progress, plan.
5. **Access control:** doctors + permissions modal, removed patients/doctors.
6. **Comms & audit:** chat (inbox + thread), activity log + filters.
7. **Polish:** idle logout, dark-mode parity sweep, responsive breakpoints, back-to-top, RTL/LTR per locale.
```
