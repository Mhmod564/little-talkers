"use client";

import { useRouter } from "next/navigation";

import { Icon, type IconName } from "@/components/icons";
import { PatientsView } from "@/components/patients/PatientsView";
import type { PatientListItem, TherapistOption } from "@/lib/data/patients";
import { useI18n, type DictKey } from "@/providers/hooks";

type Stat = {
  cls: string;
  icon: IconName;
  labelKey: DictKey;
  value: number;
  footKey: DictKey;
  href: string;
};

export function DashboardView({
  patients,
  therapists,
  canManage,
  upcoming,
  recordings,
  reports,
}: {
  patients: PatientListItem[];
  therapists: TherapistOption[];
  canManage: boolean;
  upcoming: number;
  recordings: number;
  reports: number;
}) {
  const { t } = useI18n();
  const router = useRouter();

  const stats: Stat[] = [
    { cls: "purple", icon: "users", labelKey: "stTotal", value: patients.length, footKey: "stTotalFoot", href: "/patients" },
    { cls: "amber", icon: "calendar", labelKey: "nSessions", value: upcoming, footKey: "stUpcomingFoot", href: "/sessions" },
    { cls: "green", icon: "video", labelKey: "nRecordings", value: recordings, footKey: recordings ? "stRecFoot" : "stRecEmpty", href: "/recordings" },
    { cls: "blue", icon: "report", labelKey: "nReports", value: reports, footKey: "stReportsFoot", href: "/reports" },
  ];

  return (
    <>
      <div className="stat-grid">
        {stats.map((s) => (
          <button key={s.labelKey} className="stat-card" onClick={() => router.push(s.href)}>
            <div className={`stat-ico ${s.cls}`}>
              <Icon name={s.icon} />
            </div>
            <div className="stat-meta">
              <div className="label">{t(s.labelKey)}</div>
              <div className="value">{s.value}</div>
              <div className="foot">{t(s.footKey)}</div>
            </div>
          </button>
        ))}
      </div>

      <PatientsView patients={patients} therapists={therapists} canManage={canManage} compact />

      <div className="note-banner">
        <div className="ico">
          <Icon name="bulb" />
        </div>
        <div>
          <h4>{t("tipTitle")}</h4>
          <p>{t("tipText")}</p>
        </div>
      </div>
    </>
  );
}
