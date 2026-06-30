import { listPatients } from "@/lib/data/patients";
import { RemovedView } from "@/components/removed/RemovedView";

export default async function RemovedPage() {
  const patients = await listPatients(true); // soft-deleted set
  return <RemovedView patients={patients} />;
}
