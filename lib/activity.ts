import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type LogKind =
  | "note"
  | "progress"
  | "plan"
  | "file"
  | "patient"
  | "remove"
  | "session"
  | "doctor"
  | "perms"
  | "recording"
  | "message"
  | "info";

/**
 * Append an activity-log entry. `actionKey` is a dictionary key (translated at
 * display time); `meta` carries interpolation args (e.g. { arg: 65 }).
 */
export async function logActivity(
  supabase: SupabaseClient,
  args: {
    actorId: string;
    actorName: string;
    actionKey: string;
    kind: LogKind;
    patientId?: string | null;
    meta?: Record<string, unknown> | null;
  },
): Promise<void> {
  try {
    await supabase.from("activity_logs").insert({
      actor_id: args.actorId,
      actor_name: args.actorName,
      action_key: args.actionKey,
      kind: args.kind,
      patient_id: args.patientId ?? null,
      meta: args.meta ?? null,
    });
  } catch (err) {
    console.error("[logActivity]", err);
  }
}
