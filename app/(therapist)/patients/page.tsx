import { getCurrentProfile } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listPatients, listTherapists } from "@/lib/data/patients";
import { PatientsView } from "@/components/patients/PatientsView";

export default async function PatientsPage() {
  const [profile, patients, therapists] = await Promise.all([
    getCurrentProfile(),
    listPatients(),
    listTherapists(),
  ]);

  const canManage = can(profile?.role, profile?.permissions, "manage_patients");

  return (
    <PatientsView patients={patients} therapists={therapists} canManage={canManage} />
  );
}
