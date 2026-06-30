import { notFound } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getPatientDetail, listTherapists } from "@/lib/data/patients";
import { getPatientClinical } from "@/lib/data/clinical";
import { PatientProfile } from "@/components/patients/PatientProfile";
import type { Caps } from "@/lib/types";

export default async function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [profile, detail, clinical, therapists] = await Promise.all([
    getCurrentProfile(),
    getPatientDetail(id),
    getPatientClinical(id),
    listTherapists(),
  ]);
  if (!detail) notFound();

  const role = profile?.role;
  const perms = profile?.permissions;
  const caps: Caps = {
    manage_patients: can(role, perms, "manage_patients"),
    manage_notes: can(role, perms, "manage_notes"),
    manage_sessions: can(role, perms, "manage_sessions"),
    manage_files: can(role, perms, "manage_files"),
    manage_recordings: can(role, perms, "manage_recordings"),
    chat: can(role, perms, "chat"),
  };

  // chat has no view_all bypass: only the assigned therapist (with chat perm) can message
  const therapistCanChat = caps.chat && detail.therapist_id === profile?.id;

  return (
    <PatientProfile
      detail={detail}
      clinical={clinical}
      therapists={therapists}
      caps={caps}
      therapistCanChat={therapistCanChat}
    />
  );
}
