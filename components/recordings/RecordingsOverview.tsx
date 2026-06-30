"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { RecordingModal } from "@/components/modals/clinical";
import { deleteRecording } from "@/app/actions/clinical";
import { fmtDate } from "@/lib/format";
import type { RecordingOverviewItem } from "@/lib/data/clinical";
import type { TherapistOption } from "@/lib/data/patients";
import { useI18n, useToast } from "@/providers/hooks";

export function RecordingsOverview({
  recordings,
  patients,
  therapists,
  canManage,
}: {
  recordings: RecordingOverviewItem[];
  patients: { id: string; full_name: string }[];
  therapists: TherapistOption[];
  canManage: boolean;
}) {
  const { t, ti, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const groups = useMemo(() => {
    let list = recordings.slice();
    if (patient) list = list.filter((r) => r.patient_id === patient);
    if (doctor) list = list.filter((r) => r.therapist_id === doctor);
    const q = search.trim();
    if (q) list = list.filter((r) => (r.title || "").includes(q) || r.patient_name.includes(q));
    const map = new Map<string, { name: string; items: RecordingOverviewItem[] }>();
    for (const r of list) {
      if (!map.has(r.patient_id)) map.set(r.patient_id, { name: r.patient_name, items: [] });
      map.get(r.patient_id)!.items.push(r);
    }
    return Array.from(map.entries()).map(([id, g]) => ({ id, ...g }));
  }, [recordings, patient, doctor, search]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const active = !!(patient || doctor || search);

  async function onDelete(r: RecordingOverviewItem) {
    const res = await deleteRecording({ patientId: r.patient_id, id: r.id });
    if (res.success) {
      toast(t("tRecDeleted"));
      router.refresh();
    } else toast(res.error, "err");
  }

  return (
    <>
      <div className="card">
        <div className="toolbar tb-section">
          {canManage && (
            <button className="btn btn-primary tb-action" onClick={() => setAddOpen(true)}>
              <Icon name="plus" /> {t("btnAddRec")}
            </button>
          )}
          <div className="search tb-search">
            <Icon name="search" />
            <input placeholder={t("phSearchRec")} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="tb-filters">
            <label className="fsel">
              <Icon name="filter" />
              <select value={patient} onChange={(e) => setPatient(e.target.value)}>
                <option value="">{t("allPatients")}</option>
                {patients.map((p) => (<option key={p.id} value={p.id}>{p.full_name}</option>))}
              </select>
            </label>
            <label className="fsel">
              <Icon name="filter" />
              <select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
                <option value="">{t("allDoctors")}</option>
                {therapists.map((d) => (<option key={d.id} value={d.id}>{d.full_name}</option>))}
              </select>
            </label>
          </div>
          {active && (
            <div className="tb-clear">
              <button className="btn btn-ghost btn-sm" onClick={() => { setPatient(""); setDoctor(""); setSearch(""); }}>
                <Icon name="x" /> {t("clear")}
              </button>
            </div>
          )}
        </div>

        {total === 0 ? (
          <div className="empty"><Icon name="video" /><p>{active ? t("emptyRecMatch") : t("emptyNoRec")}</p></div>
        ) : (
          groups.map((g) => (
            <div className="group" key={g.id}>
              <div className="group-head" onClick={() => router.push(`/patients/${g.id}`)}>
                <Avatar id={g.id} name={g.name} size="md" />
                <div>
                  <div className="gn">{g.name}</div>
                  <div className="gs">{ti("recCount", g.items.length)}</div>
                </div>
              </div>
              <div className="rec-list">
                {g.items.map((r) => (
                  <div className="rec-item" key={r.id}>
                    <div className="rec-ico"><Icon name="video" /></div>
                    <div className="rec-main">
                      <div className="rn">{r.title || t("recDefault")}</div>
                      <div className="rs"><Icon name="calendar" /> {fmtDate(r.recorded_on, locale)}</div>
                    </div>
                    {r.url && (
                      <a className="btn btn-soft btn-sm" href={r.url} target="_blank" rel="noopener">
                        <Icon name="play" /> {t("btnWatch")}
                      </a>
                    )}
                    {canManage && (
                      <button className="icon-btn danger" title={t("ttDelete")} onClick={() => onDelete(r)}>
                        <Icon name="trash" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {addOpen && <RecordingModal patients={patients} onClose={() => setAddOpen(false)} />}
    </>
  );
}
