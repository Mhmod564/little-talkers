import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Permissions, UserRole } from "@/lib/types";

export type DoctorItem = {
  id: string;
  full_name: string;
  username: string;
  title: string | null;
  role: UserRole;
  bio: string | null;
  phone: string | null;
  age: number | null;
  avatar_url: string | null;
  permissions: Permissions | null;
  is_active: boolean;
  removed_at: string | null;
  patient_count: number;
};

/** All therapist accounts (active + removed) with their assigned-patient counts. */
export async function listDoctors(): Promise<DoctorItem[]> {
  const supabase = await createClient();
  const [{ data: profs }, { data: pats }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, username, title, role, bio, phone, age, avatar_url, permissions, is_active, updated_at",
      )
      .in("role", ["main_therapist", "therapist"])
      .order("role", { ascending: true })
      .order("full_name", { ascending: true }),
    supabase.from("patients").select("therapist_id").is("deleted_at", null),
  ]);

  const counts = new Map<string, number>();
  for (const p of pats ?? []) {
    const tid = (p as { therapist_id: string | null }).therapist_id;
    if (tid) counts.set(tid, (counts.get(tid) ?? 0) + 1);
  }

  return (profs ?? []).map((d) => ({
    id: d.id,
    full_name: d.full_name,
    username: d.username,
    title: d.title,
    role: d.role,
    bio: d.bio,
    phone: d.phone,
    age: d.age,
    avatar_url: d.avatar_url,
    permissions: d.permissions,
    is_active: d.is_active,
    removed_at: d.is_active ? null : (d.updated_at as string),
    patient_count: counts.get(d.id) ?? 0,
  }));
}

/** The current signed-in therapist's own profile, for the self-profile page. */
export async function getMyDoctor(): Promise<DoctorItem | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: d } = await supabase
    .from("profiles")
    .select(
      "id, full_name, username, title, role, bio, phone, age, avatar_url, permissions, is_active, updated_at",
    )
    .eq("id", auth.user.id)
    .maybeSingle();
  if (!d) return null;
  return {
    id: d.id,
    full_name: d.full_name,
    username: d.username,
    title: d.title,
    role: d.role,
    bio: d.bio,
    phone: d.phone,
    age: d.age,
    avatar_url: d.avatar_url,
    permissions: d.permissions,
    is_active: d.is_active,
    removed_at: null,
    patient_count: 0,
  };
}
