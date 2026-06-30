import { Icon } from "@/components/icons";
import { getCurrentProfile } from "@/lib/auth";
import { listDoctors } from "@/lib/data/doctors";
import { DoctorsView } from "@/components/doctors/DoctorsView";
import { translate } from "@/lib/i18n";

export default async function DoctorsPage() {
  const me = await getCurrentProfile();
  if (!me || me.role !== "main_therapist") {
    return (
      <div className="card">
        <div className="empty">
          <Icon name="shield" />
          <p>{translate(0, "onlyMain")}</p>
        </div>
      </div>
    );
  }
  const doctors = await listDoctors();
  return <DoctorsView doctors={doctors} />;
}
