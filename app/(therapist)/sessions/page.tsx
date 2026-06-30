import { getCurrentProfile } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listPatients, listTherapists } from "@/lib/data/patients";
import { listAllSessions } from "@/lib/data/clinical";
import { SessionsOverview } from "@/components/sessions/SessionsOverview";

export default async function SessionsPage() {
  const [profile, sessions, patients, therapists] = await Promise.all([
    getCurrentProfile(),
    listAllSessions(),
    listPatients(),
    listTherapists(),
  ]);
  const canManage = can(profile?.role, profile?.permissions, "manage_sessions");
  return (
    <SessionsOverview
      sessions={sessions}
      patients={patients.map((p) => ({ id: p.id, full_name: p.full_name }))}
      therapists={therapists}
      canManage={canManage}
    />
  );
}
