import type { DictKey } from "@/lib/i18n";
import type { Permission, Permissions, UserRole } from "@/lib/types";

export const ALL_PERMS: Permission[] = [
  "view_all",
  "manage_patients",
  "manage_notes",
  "manage_sessions",
  "manage_files",
  "manage_recordings",
  "chat",
  "view_reports",
  "view_log",
];

/** permission key → dictionary label (matches prototype PERM_KEY). */
export const PERM_LABEL: Record<Permission, DictKey> = {
  view_all: "permViewAll",
  manage_patients: "permManage",
  manage_notes: "permNotes",
  manage_sessions: "permSessions",
  manage_files: "permFiles",
  manage_recordings: "permRec",
  chat: "permChat",
  view_reports: "permReports",
  view_log: "permLog",
};

export const fullPerms = (): Permissions =>
  Object.fromEntries(ALL_PERMS.map((k) => [k, true])) as Permissions;

/** Client-side convenience mirror of the SQL `can()` (UI gating only; RLS is the real guard). */
export function can(
  role: UserRole | null | undefined,
  permissions: Permissions | null | undefined,
  perm: Permission,
): boolean {
  if (role === "main_therapist") return true;
  if (role === "therapist") return !!permissions?.[perm];
  return false;
}
