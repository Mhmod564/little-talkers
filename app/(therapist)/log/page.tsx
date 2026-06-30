import { Icon } from "@/components/icons";
import { getCurrentProfile } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listLogs } from "@/lib/data/logs";
import { listDoctors } from "@/lib/data/doctors";
import { LogView } from "@/components/log/LogView";
import { translate } from "@/lib/i18n";

export default async function LogPage() {
  const me = await getCurrentProfile();
  if (!me || !can(me.role, me.permissions, "view_log")) {
    return (
      <div className="card">
        <div className="empty"><Icon name="shield" /><p>{translate(0, "onlyMain")}</p></div>
      </div>
    );
  }
  const [logs, doctors] = await Promise.all([listLogs(), listDoctors()]);
  return (
    <LogView
      logs={logs}
      doctors={doctors.map((d) => ({ id: d.id, full_name: d.full_name }))}
    />
  );
}
