import { getCurrentProfile } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listPatients, listTherapists } from "@/lib/data/patients";
import { dashboardCounts } from "@/lib/data/clinical";
import { DashboardView } from "@/components/patients/DashboardView";

export default async function DashboardPage() {
  const [profile, patients, therapists, counts] = await Promise.all([
    getCurrentProfile(),
    listPatients(),
    listTherapists(),
    dashboardCounts(),
  ]);

  const canManage = can(profile?.role, profile?.permissions, "manage_patients");

  return (
    <DashboardView
      patients={patients}
      therapists={therapists}
      canManage={canManage}
      upcoming={counts.upcoming}
      recordings={counts.recordings}
      reports={counts.reports}
    />
  );
}
