# Little Talkers

A clean, minimalist MVP web app for a **Speech & Language Therapy clinic**.
The interface is in **Hebrew (RTL)**. Two roles: **Therapist** and **Parent**.

## Running

No build step, no dependencies, no server. Just open **`index.html`** in a browser.

Data is stored locally in the browser (`localStorage`). To reset everything back to the
demo data, run this in the browser console: `LittleTalkersReset()`.

## Demo accounts

| Role | Username | Password |
|------|----------|----------|
| Main therapist | `doctor` | `1234` |
| Therapist | `khaled` | `1234` |
| Parent (Ahmad) | `ahmad` | `1234` |
| Parent (Layan) | `layan` | `1234` |
| Parent (Saleem) | `saleem` | `1234` |
| Parent (Noor) | `noor` | `1234` |

## Features

**Therapist**
- Add / edit / delete patients and assign a treating therapist.
- Session notes, progress tracking, next therapy plan.
- Upcoming sessions (per patient + a clinic-wide schedule page).
- **Recorded sessions** — attach a video link per session; parents can watch it.
- File/report uploads, with a dedicated **Reports** page grouping every file under its patient.
- Two-way **chat** with each patient's parent (unread badge on the notification bell).
- **Activity log** — every action recorded with date + therapist name, filterable.
- Filters on every section (patients, sessions, recordings, reports, log).

**Main therapist only**
- Create / edit / delete other therapist accounts.
- Edit a therapist's name, username, password, and **permissions**
  (view all patients, manage patients, manage recordings, chat).

**Parent (read-only)**
- View their own child's profile: progress, notes, upcoming sessions, recorded sessions,
  files, and the next therapy plan.
- Chat with the therapist.

## Project structure

- `index.html` — entry point (`lang="he"`, RTL).
- `styles.css` — design system (soft pastel palette, rounded cards, responsive).
- `app.js` — all logic (auth, routing, state, rendering, `localStorage`).

Single-page app, vanilla JS, no framework or build tooling.

## Security note

This is a prototype. Credentials are stored and compared in plain text in `localStorage`,
and access control is client-side only. A real deployment needs a backend with hashed
passwords and server-enforced authorization.
