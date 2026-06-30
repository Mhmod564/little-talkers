import "server-only";

import { createClient } from "@/lib/supabase/server";

export type PatientListItem = {
  id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  birth_date: string | null;
  phone: string | null;
  diagnosis: string | null;
  progress: number;
  last_session: string | null;
  guardian_name: string | null;
  avatar_url: string | null;
  therapist_id: string | null;
  therapist_name: string | null;
  parent_username: string | null;
};

export type TherapistOption = { id: string; full_name: string };

// PostgREST embeds come back typed as arrays; normalize a to-one relation.
function one<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

/** Patients visible to the current user (RLS-scoped). `removed` toggles the soft-deleted set. */
export async function listPatients(removed = false): Promise<PatientListItem[]> {
  const supabase = await createClient();
  let q = supabase
    .from("patients")
    .select(
      "id, full_name, age, gender, birth_date, phone, diagnosis, progress, last_session, guardian_name, avatar_url, therapist_id, therapist:profiles!therapist_id(full_name), parent:profiles!parent_id(username)",
    )
    .order("created_at", { ascending: false });
  q = removed ? q.not("deleted_at", "is", null) : q.is("deleted_at", null);

  const { data, error } = await q;
  if (error) {
    console.error("[listPatients]", error);
    return [];
  }
  return (data ?? []).map((p) => {
    const therapist = one<{ full_name: string }>(p.therapist);
    const parent = one<{ username: string }>(p.parent);
    return {
      id: p.id,
      full_name: p.full_name,
      age: p.age,
      gender: p.gender,
      birth_date: p.birth_date,
      phone: p.phone,
      diagnosis: p.diagnosis,
      progress: p.progress ?? 0,
      last_session: p.last_session,
      guardian_name: p.guardian_name,
      avatar_url: p.avatar_url,
      therapist_id: p.therapist_id,
      therapist_name: therapist?.full_name ?? null,
      parent_username: parent?.username ?? null,
    };
  });
}

export type PatientDetail = {
  id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  birth_date: string | null;
  guardian_name: string | null;
  phone: string | null;
  diagnosis: string | null;
  progress: number;
  plan: string | null;
  last_session: string | null;
  avatar_url: string | null;
  therapist_id: string | null;
  therapist_name: string | null;
  parent_username: string | null;
};

/** Full patient record for the profile page (RLS-scoped). */
export async function getPatientDetail(id: string): Promise<PatientDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .select(
      "id, full_name, age, gender, birth_date, guardian_name, phone, diagnosis, progress, plan, last_session, avatar_url, therapist_id, therapist:profiles!therapist_id(full_name), parent:profiles!parent_id(username)",
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !data) return null;
  const therapist = one<{ full_name: string }>(data.therapist);
  const parent = one<{ username: string }>(data.parent);
  return {
    id: data.id,
    full_name: data.full_name,
    age: data.age,
    gender: data.gender,
    birth_date: data.birth_date,
    guardian_name: data.guardian_name,
    phone: data.phone,
    diagnosis: data.diagnosis,
    progress: data.progress ?? 0,
    plan: data.plan,
    last_session: data.last_session,
    avatar_url: data.avatar_url,
    therapist_id: data.therapist_id,
    therapist_name: therapist?.full_name ?? null,
    parent_username: parent?.username ?? null,
  };
}

/** Active therapists for filter dropdowns / patient assignment. */
export async function listTherapists(): Promise<TherapistOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("role", ["main_therapist", "therapist"])
    .eq("is_active", true)
    .order("full_name");
  return (data ?? []) as TherapistOption[];
}
