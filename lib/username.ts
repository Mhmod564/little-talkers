import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Generate the next sequential, auto-assigned username for a role prefix,
 * e.g. `therapist7` or `parent3`. Usernames are system-owned: they are never
 * chosen or edited by users — only generated here at account-creation time.
 *
 * Picks max(existing number for the prefix) + 1, so deletions don't cause
 * collisions with currently-live accounts. Requires the admin client (it must
 * see every profile, including removed ones, to stay unique).
 */
export async function nextUsername(
  admin: SupabaseClient,
  prefix: "therapist" | "parent",
): Promise<string> {
  const { data } = await admin
    .from("profiles")
    .select("username")
    .ilike("username", `${prefix}%`);

  const re = new RegExp(`^${prefix}(\\d+)$`, "i");
  let max = 0;
  for (const row of (data ?? []) as { username: string | null }[]) {
    const m = re.exec(row.username ?? "");
    if (m && m[1]) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${prefix}${max + 1}`;
}
