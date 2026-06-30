import "server-only";

import { createClient } from "@/lib/supabase/server";

export type ChatMessage = {
  id: string;
  patient_id: string;
  sender_role: string;
  sender_id: string | null;
  sender_name: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

function one<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

/** Chat messages for one patient (RLS: participants only), oldest first. */
export async function getChat(patientId: string): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, patient_id, sender_role, sender_id, body, read_at, created_at, sender:profiles!sender_id(full_name)")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[getChat]", error);
    return [];
  }
  return (data ?? []).map((m) => {
    const s = one<{ full_name: string }>(m.sender);
    return {
      id: m.id,
      patient_id: m.patient_id,
      sender_role: m.sender_role,
      sender_id: m.sender_id,
      sender_name: s?.full_name ?? "",
      body: m.body,
      read_at: m.read_at,
      created_at: m.created_at,
    };
  });
}

export type InboxItem = {
  patient_id: string;
  patient_name: string;
  guardian_name: string | null;
  last_body: string;
  last_at: string;
  unread: number;
};

/** Therapist inbox: one row per patient that has messages, newest first. */
export async function listInbox(): Promise<InboxItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("patient_id, sender_role, body, read_at, created_at, patient:patients!patient_id(full_name, guardian_name)")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listInbox]", error);
    return [];
  }
  const map = new Map<string, InboxItem>();
  for (const m of data ?? []) {
    const p = one<{ full_name: string; guardian_name: string | null }>(m.patient);
    let row = map.get(m.patient_id);
    if (!row) {
      row = {
        patient_id: m.patient_id,
        patient_name: p?.full_name ?? "—",
        guardian_name: p?.guardian_name ?? null,
        last_body: m.body,
        last_at: m.created_at,
        unread: 0,
      };
      map.set(m.patient_id, row);
    }
    if (m.sender_role === "parent" && !m.read_at) row.unread += 1;
  }
  return Array.from(map.values());
}

/** The parent's own child id (for the parent chat page). */
export async function myChildId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from("patients")
    .select("id")
    .eq("parent_id", auth.user.id)
    .is("deleted_at", null)
    .maybeSingle<{ id: string }>();
  return data?.id ?? null;
}
