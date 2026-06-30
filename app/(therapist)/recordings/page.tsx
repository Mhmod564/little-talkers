import { getCurrentProfile } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listPatients, listTherapists } from "@/lib/data/patients";
import { listAllRecordings } from "@/lib/data/clinical";
import { RecordingsOverview } from "@/components/recordings/RecordingsOverview";

export default async function RecordingsPage() {
  const [profile, recordings, patients, therapists] = await Promise.all([
    getCurrentProfile(),
    listAllRecordings(),
    listPatients(),
    listTherapists(),
  ]);
  const canManage = can(profile?.role, profile?.permissions, "manage_recordings");
  return (
    <RecordingsOverview
      recordings={recordings}
      patients={patients.map((p) => ({ id: p.id, full_name: p.full_name }))}
      therapists={therapists}
      canManage={canManage}
    />
  );
}
