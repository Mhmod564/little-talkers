import "server-only";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * The signed-in user's profile (or null). Server-only; RLS lets a user read
 * their own row.
 *
 * Wrapped in React `cache()` so it runs at most once per request even though
 * both the layout and the page (and sometimes child components) call it —
 * without this, every page render did 2–3× getUser() + profile queries against
 * Supabase, which under load rate-limited Auth and bounced users to /login.
 */
export const getCurrentProfile = cache(
  async (): Promise<Profile | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<Profile>();

    return data ?? null;
  },
);
