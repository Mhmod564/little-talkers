"use server";

import { getCurrentProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { nextUsername } from "@/lib/username";

/**
 * Preview the username that will be auto-assigned to the next therapist/parent,
 * so the create form can show it before submitting. Purely informational — the
 * real username is (re)generated server-side at creation time.
 */
export async function previewNextUsername(
  kind: "therapist" | "parent",
): Promise<string> {
  const me = await getCurrentProfile();
  if (!me || me.role === "parent") return "";
  return nextUsername(createAdminClient(), kind);
}
