"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { getFileUrl } from "@/app/actions/files";
import { fmtDate, fmtSize } from "@/lib/format";
import type { FileOverviewItem } from "@/lib/data/clinical";
import type { TherapistOption } from "@/lib/data/patients";
import { useI18n, useToast } from "@/providers/hooks";

export function ReportsOverview({
  files,
  patients,
  therapists,
}: {
  files: FileOverviewItem[];
  patients: { id: string; full_name: string }[];
  therapists: TherapistOption[];
}) {
  const { t, ti, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("");
  const [search, setSearch] = useState("");

  const groups = useMemo(() => {
    let list = files.slice();
    if (patient) list = list.filter((f) => f.patient_id === patient);
    if (doctor) list = list.filter((f) => f.therapist_id === doctor);
    const q = search.trim();
    if (q) list = list.filter((f) => f.name.includes(q) || f.patient_name.includes(q));
    const map = new Map<string, { name: string; items: FileOverviewItem[] }>();
    for (const f of list) {
      if (!map.has(f.patient_id)) map.set(f.patient_id, { name: f.patient_name, items: [] });
      map.get(f.patient_id)!.items.push(f);
    }
    return Array.from(map.entries()).map(([id, g]) => ({ id, ...g }));
  }, [files, patient, doctor, search]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const active = !!(patient || doctor || search);

  async function onDownload(f: FileOverviewItem) {
    const res = await getFileUrl(f.storage_path);
    if (res.success) {
      toast(ti("tDownloading", f.name));
      window.open(res.data.url, "_blank", "noopener");
    } else toast(res.error, "err");
  }

  return (
    <div className="card">
      <div className="toolbar tb-section">
        <div className="search tb-search">
          <Icon name="search" />
          <input placeholder={t("phSearchFile")} value={search} onChange={(e) => setSearch(e.target.value)} />
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
        <div className="empty"><Icon name="file" /><p>{active ? t("emptyFileMatch") : t("emptyNoFiles")}</p></div>
      ) : (
        groups.map((g) => (
          <div className="group" key={g.id}>
            <div className="group-head" onClick={() => router.push(`/patients/${g.id}`)}>
              <Avatar id={g.id} name={g.name} size="md" />
              <div>
                <div className="gn">{g.name}</div>
                <div className="gs">{ti("filesCount", g.items.length)}</div>
              </div>
            </div>
            <div className="file-list">
              {g.items.map((f) => (
                <div className="file-item" key={f.id}>
                  <div className="file-ico"><Icon name="file" /></div>
                  <div className="file-meta">
                    <div className="fn">{f.name}</div>
                    <div className="fs">{fmtSize(f.size)} · {fmtDate(f.created_at, locale)}</div>
                  </div>
                  <button className="icon-btn" title={t("ttDownload")} onClick={() => onDownload(f)}>
                    <Icon name="download" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
