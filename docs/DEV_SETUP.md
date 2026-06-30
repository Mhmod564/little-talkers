# Dev setup — Next.js + Supabase rewrite

The new app (Next.js App Router + TypeScript + Tailwind + Supabase) lives at the repo root.
The old vanilla prototype (`index.html`, `app.js`, `styles.css`) stays as reference and is not used
by the Next app.

## 1. Install Node.js

Node is **not** installed on this machine yet. Install the **LTS** build from https://nodejs.org
(or `winget install OpenJS.NodeJS.LTS`). Verify in a new terminal:

```
node --version   # v20+ expected
npm --version
```

## 2. Environment variables

`.env.local` already exists with the real keys for the `little-talkers` Supabase project
(ref `hbzsfgcyeapjcgzusoef`). It is gitignored. `.env.example` documents the same variables.

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public, used by the browser.
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only secret**. Used only inside Server Actions
  (`lib/supabase/admin.ts`, guarded by `import "server-only"`). Never exposed to the client.
- `RESEND_API_KEY` / `LOGIN_CODE_FROM_EMAIL` — email delivery for the login code. Until set, the
  6-digit code is **printed to the server console** (and shown on screen in dev) so you can log in.

## 3. Install & run

```
npm install
npm run dev      # http://localhost:3000
npm run typecheck
npm run build
```

## 4. Try the login flow

Seeded therapist (created during DB setup):

- **username:** `dr.sara`
- **password:** `Therapist#2026`

Step 1 (username + password) emails a code; in dev the code appears on screen / in the terminal.
Step 2 (the code) creates the session and lands on `/dashboard`, which lists patients **through RLS**
(you'll see يوسف أحمد).

## What exists after Phase 1 (scaffold)

```
app/
  layout.tsx            RTL Arabic shell + Tajawal font
  page.tsx              redirect: signed-in -> /dashboard, else -> /login
  login/page.tsx        two-step login UI (useActionState)
  dashboard/page.tsx    RLS-aware Server Component (patients list + sign out)
  actions/auth.ts       requestLoginCode / verifyLoginCode / signOut
  globals.css           Tailwind + pastel CSS variables
lib/
  types.ts              ActionResult contract + domain types
  zod-schemas.ts        input validation
  supabase/client.ts    browser client (anon)
  supabase/server.ts    user-scoped server client (RLS)
  supabase/admin.ts     service-role client (server-only)
  supabase/middleware.ts session refresh + route gate
middleware.ts
supabase/migrations/    0001 schema · 0002 RLS · 0003 seed · 0004 storage  (already applied)
```

## Next phases (per docs/REWRITE_PLAN.md)

4. Patients (list/detail/CRUD + soft delete/restore) — port the design system.
5. Clinical data (notes, sessions, recordings, files via Storage, progress, plan).
6. Access control UI (permissions, doctors management, removed page).
7. Chat + activity log.
8. i18n (he/ar/en) + dark mode + idle logout + responsive polish.
9. Deploy to Vercel (set the same env vars in the Vercel project).
