"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import {
  SessionModal,
  SessionDetailsModal,
  SessionSummaryModal,
} from "@/components/modals/clinical";
import { deleteSession } from "@/app/actions/clinical";
import { fmtDate, monthShort } from "@/lib/format";
import type { SessionOverviewItem } from "@/lib/data/clinical";
import type { TherapistOption } from "@/lib/data/patients";
import type { SessionRow } from "@/lib/types";
import { useI18n, useToast } from "@/providers/hooks";

type Modal =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit"; s: SessionOverviewItem }
  | { type: "details"; s: SessionOverviewItem }
  | { type: "summary"; s: SessionOverviewItem };

export function SessionsOverview({
  sessions,
  patients,
  therapists,
  canManage,
}: {
  sessions: SessionOverviewItem[];
  patients: { id: string; full_name: string }[];
  therapists: TherapistOption[];
  canManage: boolean;
}) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Modal>({ type: "none" });
  const close = () => setModal({ type: "none" });

  const filtered = useMemo(() => {
    let list = sessions.slice();
    if (patient) list = list.filter((s) => s.patient_id === patient);
    if (doctor) list = list.filter((s) => s.therapist_id === doctor);
    const q = search.trim();
    if (q) list = list.filter((s) => (s.title || "").includes(q) || s.patient_name.includes(q));
    return list;
  }, [sessions, patient, doctor, search]);

  const upcoming = filtered.filter((s) => s.upcoming);
  const past = filtered.filter((s) => !s.upcoming).reverse();
  const active = !!(patient || doctor || search);

  async function onDelete(s: SessionOverviewItem) {
    const res = await deleteSession({ patientId: s.patient_id, id: s.id });
    if (res.success) {
      toast(t("tSessionDeleted"));
      router.refresh();
    } else toast(res.error, "err");
  }

  const item = (s: SessionOverviewItem) => {
    const time = new Date(s.scheduled_at).toTimeString().slice(0, 5);
    return (
      <div
        key={s.id}
        className="session-item clickable"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          setModal({ type: "details", s });
        }}
      >
        <div className={`date-chip ${s.upcoming ? "" : "past"}`}>
          <b>{new Date(s.scheduled_at).getDate()}</b>
          <span>{monthShort(s.scheduled_at, locale)}</span>
        </div>
        <div className="session-main">
          <div className="st">
            {s.title || t("sesDefault")}
            {s.pending ? <span className="need-sum"> {t("needsSummary")}</span> : null}
          </div>
          <div className="ss">
            <Icon name="user" /> {s.patient_name} · <Icon name="clock" /> {time} · {fmtDate(s.scheduled_at, locale)}
          </div>
        </div>
        {canManage && (
          <div className="row-actions">
            <button className="icon-btn" title={t("ttEdit")} onClick={() => setModal({ type: "edit", s })}>
              <Icon name="edit" />
            </button>
            <button className="icon-btn danger" title={t("ttDelete")} onClick={() => onDelete(s)}>
              <Icon name="trash" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const asSessionRow = (s: SessionOverviewItem): SessionRow => ({
    id: s.id,
    scheduled_at: s.scheduled_at,
    title: s.title,
    summary: s.summary,
    upcoming: s.upcoming,
    pending: s.pending,
  });

  return (
    <>
      <div className="card">
        <div className="toolbar tb-section">
          {canManage && (
            <button className="btn btn-primary tb-action" onClick={() => setModal({ type: "add" })}>
              <Icon name="plus" /> {t("btnSchedule")}
            </button>
          )}
          <div className="search tb-search">
            <Icon name="search" />
            <input placeholder={t("phSearchSession")} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="tb-filters">
            <label className="fsel">
              <Icon name="filter" />
              <select value={patient} onChange={(e) => setPatient(e.target.value)}>
                <option value="">{t("allPatients")}</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </label>
            <label className="fsel">
              <Icon name="filter" />
              <select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
                <option value="">{t("allDoctors")}</option>
                {therapists.map((d) => (
                  <option key={d.id} value={d.id}>{d.full_name}</option>
                ))}
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
        {upcoming.length === 0 ? (
          <div className="empty"><Icon name="calendar" /><p>{t("emptyNoUpcoming")}</p></div>
        ) : (
          <div className="session-list">{upcoming.map(item)}</div>
        )}
      </div>

      {past.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="subhead"><h3>{t("sesPast")}</h3><span className="count">{past.length}</span></div>
          <div className="session-list muted">{past.map(item)}</div>
        </div>
      )}

      {modal.type === "add" && (
        <SessionModal patients={patients} onClose={close} />
      )}
      {modal.type === "edit" && (
        <SessionModal patientId={modal.s.patient_id} session={asSessionRow(modal.s)} onClose={close} />
      )}
      {modal.type === "details" && (
        <SessionDetailsModal
          patientName={modal.s.patient_name}
          session={asSessionRow(modal.s)}
          canWrite={canManage && !modal.s.upcoming}
          onWriteSummary={() => setModal({ type: "summary", s: modal.s })}
          onClose={close}
        />
      )}
      {modal.type === "summary" && (
        <SessionSummaryModal patientId={modal.s.patient_id} session={asSessionRow(modal.s)} onClose={close} />
      )}
    </>
  );
}
