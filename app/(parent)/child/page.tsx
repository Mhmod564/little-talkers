import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPatientDetail } from "@/lib/data/patients";
import { getPatientClinical } from "@/lib/data/clinical";
import { PatientProfile } from "@/components/patients/PatientProfile";
import { Placeholder } from "@/components/ui/Placeholder";
import type { Caps } from "@/lib/types";

const READONLY_CAPS: Caps = {
  manage_patients: false,
  manage_notes: false,
  manage_sessions: false,
  manage_files: false,
  manage_recordings: false,
  chat: false,
};

export default async function ChildPage() {
  const profile = await getCurrentProfile();
  if (!profile) return <Placeholder icon="user" labelKey="nMyChild" />;

  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("parent_id", profile.id)
    .is("deleted_at", null)
    .maybeSingle<{ id: string }>();
  if (!patient) return <Placeholder icon="user" labelKey="nMyChild" />;

  const [detail, clinical] = await Promise.all([
    getPatientDetail(patient.id),
    getPatientClinical(patient.id),
  ]);
  if (!detail) return <Placeholder icon="user" labelKey="nMyChild" />;

  let therapistInfo: { name: string; title: string | null; bio: string | null } | null = null;
  if (detail.therapist_id) {
    const { data: ther } = await supabase
      .from("profiles")
      .select("full_name, title, bio")
      .eq("id", detail.therapist_id)
      .maybeSingle<{ full_name: string; title: string | null; bio: string | null }>();
    if (ther) therapistInfo = { name: ther.full_name, title: ther.title, bio: ther.bio };
  }

  return (
    <PatientProfile
      detail={detail}
      clinical={clinical}
      therapists={[]}
      caps={READONLY_CAPS}
      therapistInfo={therapistInfo}
      parentCanChat
      readonly
    />
  );
}
