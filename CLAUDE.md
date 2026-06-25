# CLAUDE.md

Guidance for working in this repository.

## Project

**Little Talkers** (متحدثون صغار) — an MVP web app for a Speech & Language Therapy clinic.
Arabic, right-to-left (RTL). Two roles: **therapist** (`main` or `doctor`) and **parent** (read-only).

## Running

No build step, no dependencies, no server. Open `index.html` directly in a browser.
Data lives in `localStorage`. Reset to demo data from the browser console: `LittleTalkersReset()`.

There is no test suite and no package manager. "Verify" = open `index.html` and click through.
Node is not assumed to be installed on the dev machine.

## Architecture

Vanilla JS single-page app. Three files, no framework:

- `index.html` — shell: mount points `#app`, `#modal-root`, `#toast-root`; loads the Tajawal font.
- `styles.css` — all styling. Pastel design system via CSS variables at `:root` (lavender/blue/green/white).
  Calm, rounded cards, soft shadows, subtle animations, responsive (sidebar collapses under 768px).
- `app.js` — everything else, wrapped in one IIFE (`"use strict"`). No modules, no globals except
  `window.LittleTalkersReset`.

### How `app.js` is organized (top → bottom)
1. `I` — inline SVG icon set (strings).
2. Utilities — `$`, `$$`, `esc`, `uid`, `initials`, `avaClass`, date/size formatters.
3. Data layer — `seed()`, `loadDB`/`saveDB`, `getSession`/`setSession`, accessors
   (`getPatient`, `getDoctor`, `currentDoctor`), `logEvent`, `inboxFor`/`unreadCount`.
4. `state` (`freshState()`) — in-memory UI state: route, filters, selected patient, nav open.
5. `render()` — root dispatcher: login → therapist shell → parent shell.
6. View builders return HTML strings: `LoginView`, `TherapistShell`/`Sidebar`/`Topbar`, `DashboardView`,
   `PatientsView`, `SessionsView`, `LogView`, `DoctorsView`, `ProfileView`, `ParentShell`.
7. `bindShell` / `bindContent` — attach event listeners after each render (delegated via `data-*` attrs).
8. Modals/dialogs — `openModal`, `confirmDialog`, and one `open*Modal` per action.

### Rendering model
Render-on-change, no virtual DOM. Mutate `DB` → `saveDB()` → `render()` (full re-render) or
`renderTherapistContent()` (content pane only, used to keep search focus snappy). After writing HTML,
the matching `bind*` function wires up `data-*` hooks. **Every interactive element uses a `data-*`
attribute**, not inline handlers — keep this pattern.

## Data model (localStorage key `littletalkers.db.v2`)

```
DB = {
  doctors:  [{ id, username, password, name, title, role: "main"|"doctor" }],
  patients: [{ id, name, age, gender, guardian, phone, diagnosis, progress, lastSession,
               doctorId, parentUsername, parentPassword, plan,
               notes:    [{ id, date, text }],
               sessions: [{ id, date, time, title }],   // upcoming appointments
               files:    [{ id, name, size, date, data? }] }],   // data = base64 if ≤5MB
  logs:     [{ id, ts, doctorId, doctorName, action, patientName, patientId, kind }],
  messages: [{ id, ts, patientId, patientName, fromName, doctorId, doctorName, topic, text, read }],
}
```

- **Bump the version suffix** in `DB_KEY` (and reseed via `seed()`) whenever the schema changes —
  there is no migration logic. Current: `v2`. `SESSION_KEY` mirrors the version.
- Auth is plain-text comparison against `DB` (prototype only — see Security note).
- `role: "main"` doctor is the only one who can create/delete other doctors.

## Conventions

- **Language/direction:** all UI text is Arabic; document is `dir="rtl"`. Use logical CSS properties
  (`margin-inline-start`, `border-inline-start`, `text-align: start`) — not left/right.
- **Escaping:** always wrap user/DB values in `esc()` inside template strings.
- **Logging:** call `logEvent(action, { patientName, patientId, kind })` after any meaningful mutation
  so it appears in the Activity Log. `kind` drives the log icon (`note|progress|plan|file|patient|remove|session|doctor|message|info`).
- **Read-only parent:** `ProfileView(patient, readonly)` — when `readonly` is true, no edit/delete
  controls are rendered at all (the enforcement, since there's no backend).
- **Icons:** add new SVGs to the `I` map; reference as `${I.name}`.
- **Colors:** use the `:root` CSS variables; keep the soft pastel palette (no bright/saturated colors).

## Scope (intentional MVP boundaries)

In: auth, patients CRUD, notes, files, progress, next plan, upcoming sessions, multi-doctor + roles,
activity log, parent→doctor messages, filters. Out (don't add unless asked): payments, real backend,
analytics, AI, native apps, doctor→parent replies.

## Security note

Credentials are stored and compared in plain text in `localStorage`, and access control is client-side
only. Acceptable for this demo prototype; a real deployment needs a backend with hashed passwords and
server-enforced authorization. Don't present this as production-ready.
