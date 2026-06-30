import { listPatients, listTherapists } from "@/lib/data/patients";
import { listAllFiles } from "@/lib/data/clinical";
import { ReportsOverview } from "@/components/reports/ReportsOverview";

export default async function ReportsPage() {
  const [files, patients, therapists] = await Promise.all([
    listAllFiles(),
    listPatients(),
    listTherapists(),
  ]);
  return (
    <ReportsOverview
      files={files}
      patients={patients.map((p) => ({ id: p.id, full_name: p.full_name }))}
      therapists={therapists}
    />
  );
}
