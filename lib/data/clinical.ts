import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Note, Recording, FileRow, SessionRow } from "@/lib/types";

export type PatientClinical = {
  notes: Note[];
  sessions: SessionRow[];
  recordings: Recording[];
  files: FileRow[];
};

/** All clinical data for one patient (RLS-scoped). */
export async function getPatientClinical(
  patientId: string,
): Promise<PatientClinical> {
  const supabase = await createClient();
  const [notesR, sessR, recR, filesR] = await Promise.all([
    supabase
      .from("notes")
      .select("id, session_date, body")
      .eq("patient_id", patientId)
      .order("session_date", { ascending: false }),
    supabase
      .from("sessions")
      .select("id, scheduled_at, title, summary")
      .eq("patient_id", patientId)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("recordings")
      .select("id, title, recorded_on, url")
      .eq("patient_id", patientId)
      .order("recorded_on", { ascending: false }),
    supabase
      .from("files")
      .select("id, name, size, storage_path, created_at")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),
  ]);

  const now = Date.now();
  const sessions: SessionRow[] = (sessR.data ?? []).map((s) => {
    const upcoming = new Date(s.scheduled_at).getTime() >= now;
    return {
      id: s.id,
      scheduled_at: s.scheduled_at,
      title: s.title,
      summary: s.summary,
      upcoming,
      pending: !upcoming && !s.summary,
    };
  });

  return {
    notes: (notesR.data ?? []) as Note[],
    sessions,
    recordings: (recR.data ?? []) as Recording[],
    files: (filesR.data ?? []) as FileRow[],
  };
}

function one<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

type PatientRef = { id: string; full_name: string; therapist_id: string | null };

export type SessionOverviewItem = SessionRow & {
  patient_id: string;
  patient_name: string;
  therapist_id: string | null;
};

export async function listAllSessions(): Promise<SessionOverviewItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessions")
    .select("id, scheduled_at, title, summary, patient:patients!patient_id(id, full_name, therapist_id)")
    .order("scheduled_at", { ascending: true });
  const now = Date.now();
  return (data ?? []).map((s) => {
    const p = one<PatientRef>(s.patient);
    const upcoming = new Date(s.scheduled_at).getTime() >= now;
    return {
      id: s.id,
      scheduled_at: s.scheduled_at,
      title: s.title,
      summary: s.summary,
      upcoming,
      pending: !upcoming && !s.summary,
      patient_id: p?.id ?? "",
      patient_name: p?.full_name ?? "—",
      therapist_id: p?.therapist_id ?? null,
    };
  });
}

export type RecordingOverviewItem = Recording & {
  patient_id: string;
  patient_name: string;
  therapist_id: string | null;
};

export async function listAllRecordings(): Promise<RecordingOverviewItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recordings")
    .select("id, title, recorded_on, url, patient:patients!patient_id(id, full_name, therapist_id)")
    .order("recorded_on", { ascending: false });
  return (data ?? []).map((r) => {
    const p = one<PatientRef>(r.patient);
    return {
      id: r.id,
      title: r.title,
      recorded_on: r.recorded_on,
      url: r.url,
      patient_id: p?.id ?? "",
      patient_name: p?.full_name ?? "—",
      therapist_id: p?.therapist_id ?? null,
    };
  });
}

export type FileOverviewItem = FileRow & {
  patient_id: string;
  patient_name: string;
  therapist_id: string | null;
};

export async function listAllFiles(): Promise<FileOverviewItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("files")
    .select("id, name, size, storage_path, created_at, patient:patients!patient_id(id, full_name, therapist_id)")
    .order("created_at", { ascending: false });
  return (data ?? []).map((f) => {
    const p = one<PatientRef>(f.patient);
    return {
      id: f.id,
      name: f.name,
      size: f.size,
      storage_path: f.storage_path,
      created_at: f.created_at,
      patient_id: p?.id ?? "",
      patient_name: p?.full_name ?? "—",
      therapist_id: p?.therapist_id ?? null,
    };
  });
}

/** Dashboard stat counts across all patients visible to the user (RLS-scoped). */
export async function dashboardCounts(): Promise<{
  upcoming: number;
  recordings: number;
  reports: number;
}> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const [up, rec, files] = await Promise.all([
    supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .gte("scheduled_at", nowIso),
    supabase.from("recordings").select("id", { count: "exact", head: true }),
    supabase.from("files").select("id", { count: "exact", head: true }),
  ]);
  return {
    upcoming: up.count ?? 0,
    recordings: rec.count ?? 0,
    reports: files.count ?? 0,
  };
}
