import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client using the SERVICE ROLE key — bypasses RLS.
 *
 * SECURITY: server-only. The `server-only` import above makes the build fail if
 * this module is ever imported into client code. Use it only inside Server Actions
 * for trusted, validated operations (e.g. looking up a user's email by username
 * during login, writing one-time login codes). Never ship the service role key to
 * the browser and never use this client to skip an authorization check.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
