import "server-only";

import { createClient } from "@/lib/supabase/server";

export type LogItem = {
  id: string;
  created_at: string;
  actor_id: string | null;
  actor_name: string | null;
  action_key: string;
  kind: string | null;
  patient_id: string | null;
  patient_name: string | null;
  meta: Record<string, unknown> | null;
};

/** Activity log entries (RLS: requires view_log). Newest first.
 *  `activity_logs.patient_id` has no FK (logs outlive deleted patients),
 *  so patient names are resolved with a separate lookup + meta.name fallback. */
export async function listLogs(limit = 500): Promise<LogItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id, created_at, actor_id, actor_name, action_key, kind, patient_id, meta")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[listLogs]", error);
    return [];
  }
  const rows = data ?? [];

  // resolve patient names for the (RLS-visible) ids referenced by these logs
  const ids = Array.from(
    new Set(rows.map((l) => l.patient_id).filter((x): x is string => !!x)),
  );
  const names = new Map<string, string>();
  if (ids.length) {
    const { data: pats } = await supabase
      .from("patients")
      .select("id, full_name")
      .in("id", ids);
    for (const p of pats ?? []) names.set(p.id, p.full_name);
  }

  return rows.map((l) => {
    const metaName =
      l.meta && typeof l.meta === "object"
        ? (l.meta as Record<string, unknown>)["name"]
        : null;
    const fromMap = l.patient_id ? names.get(l.patient_id) : undefined;
    return {
      id: l.id,
      created_at: l.created_at,
      actor_id: l.actor_id,
      actor_name: l.actor_name,
      action_key: l.action_key,
      kind: l.kind,
      patient_id: l.patient_id,
      patient_name: fromMap ?? (typeof metaName === "string" ? metaName : null),
      meta: l.meta as Record<string, unknown> | null,
    };
  });
}
