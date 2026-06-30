// Shared domain types + the Server Action result contract (see .claude/plan.md §2).

/** Every Server Action returns this. No raw DB errors ever reach the UI. */
export type ActionResult<T = null> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Generic, user-safe error for unexpected failures. This is a DICTIONARY KEY
 *  (not literal text) — the client translates it via `t()` at display time, so
 *  every action error follows the active he/ar/en language. */
export const GENERIC_ERROR = "errGeneric";

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function fail(error: string = GENERIC_ERROR): ActionResult<never> {
  return { success: false, error };
}

// ---- Domain enums / shapes (mirror the SQL schema) -------------------------

export type UserRole = "main_therapist" | "therapist" | "parent";
export type SessionStatus = "scheduled" | "completed";

export type Permission =
  | "view_all"
  | "manage_patients"
  | "manage_notes"
  | "manage_sessions"
  | "manage_files"
  | "manage_recordings"
  | "chat"
  | "view_reports"
  | "view_log";

export type Permissions = Record<Permission, boolean>;

export interface Profile {
  id: string;
  username: string;
  role: UserRole;
  full_name: string;
  title: string | null;
  phone: string | null;
  birth_date: string | null;
  age: number | null;
  bio: string | null;
  avatar_url: string | null;
  permissions: Permissions | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  session_date: string | null;
  body: string;
}

export interface SessionRow {
  id: string;
  scheduled_at: string;
  title: string | null;
  summary: string | null;
  upcoming: boolean;
  pending: boolean; // ended but not summarized
}

export interface Recording {
  id: string;
  title: string | null;
  recorded_on: string | null;
  url: string;
}

export interface FileRow {
  id: string;
  name: string;
  size: number | null;
  storage_path: string;
  created_at: string;
}

/** Per-section capability flags passed to the patient profile. */
export interface Caps {
  manage_patients: boolean;
  manage_notes: boolean;
  manage_sessions: boolean;
  manage_files: boolean;
  manage_recordings: boolean;
  chat: boolean;
}

export interface Patient {
  id: string;
  full_name: string;
  gender: string | null;
  birth_date: string | null;
  age: number | null;
  guardian_name: string | null;
  phone: string | null;
  diagnosis: string | null;
  progress: number;
  last_session: string | null;
  therapist_id: string | null;
  parent_id: string | null;
  plan: string | null;
  avatar_url: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}
