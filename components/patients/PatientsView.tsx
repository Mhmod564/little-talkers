"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PatientModal } from "@/components/patients/PatientModal";
import { archivePatient } from "@/app/actions/patients";
import { fmtDate } from "@/lib/format";
import type { PatientListItem, TherapistOption } from "@/lib/data/patients";
import { useI18n, useToast } from "@/providers/hooks";

type Sort = "recent" | "progress-high" | "progress-low" | "name";

export function PatientsView({
  patients,
  therapists,
  canManage,
  compact = false,
}: {
  patients: PatientListItem[];
  therapists: TherapistOption[];
  canManage: boolean;
  compact?: boolean;
}) {
  const { t, ti, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [doctor, setDoctor] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [showAll, setShowAll] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PatientListItem | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<PatientListItem | null>(null);
  const [pending, setPending] = useState(false);

  const filtered = useMemo(() => {
    let list = patients.slice();
    const q = search.trim();
    if (q)
      list = list.filter(
        (p) =>
          p.full_name.includes(q) ||
          (p.diagnosis || "").includes(q) ||
          (p.guardian_name || "").includes(q),
      );
    if (doctor) list = list.filter((p) => p.therapist_id === doctor);
    if (sort === "recent")
      list.sort((a, b) => (b.last_session || "").localeCompare(a.last_session || ""));
    else if (sort === "progress-high") list.sort((a, b) => b.progress - a.progress);
    else if (sort === "progress-low") list.sort((a, b) => a.progress - b.progress);
    else if (sort === "name") list.sort((a, b) => a.full_name.localeCompare(b.full_name));
    return list;
  }, [patients, search, doctor, sort]);

  const limit = compact && !showAll ? 4 : filtered.length;
  const shown = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;
  const filtersActive = !!(search || doctor || sort !== "recent");

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(p: PatientListItem) {
    setEditing(p);
    setModalOpen(true);
  }
  async function doArchive() {
    if (!confirmTarget) return;
    setPending(true);
    const res = await archivePatient(confirmTarget.id);
    setPending(false);
    setConfirmTarget(null);
    if (res.success) {
      toast(t("tArchived"));
      router.refresh();
    } else {
      toast(res.error, "err");
    }
  }

  const header = compact ? (
    <div className="card-head dash-head">
      <h3>{t("nPatients")}</h3>
      {canManage && (
        <button className="btn btn-primary" onClick={openAdd}>
          <Icon name="plus" /> {t("nAdd")}
        </button>
      )}
      <div className="search dash-search">
        <Icon name="search" />
        <input
          placeholder={t("phSearchPatient")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  ) : (
    <div className="toolbar tb-patients">
      {canManage && (
        <button className="btn btn-primary tb-action" onClick={openAdd}>
          <Icon name="plus" /> {t("nAdd")}
        </button>
      )}
      <div className="search tb-search">
        <Icon name="search" />
        <input
          placeholder={t("phSearchNameDiag")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="tb-filters">
        <label className="fsel">
          <Icon name="stetho" />
          <select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
            <option value="">{t("allDoctors")}</option>
            {therapists.map((d) => (
              <option key={d.id} value={d.id}>
                {d.full_name}
              </option>
            ))}
          </select>
        </label>
        <label className="fsel">
          <Icon name="sort" />
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="recent">{t("sortRecent")}</option>
            <option value="progress-high">{t("sortHigh")}</option>
            <option value="progress-low">{t("sortLow")}</option>
            <option value="name">{t("sortName")}</option>
          </select>
        </label>
      </div>
      {filtersActive && (
        <div className="tb-clear">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setSearch("");
              setDoctor("");
              setSort("recent");
            }}
          >
            <Icon name="x" /> {t("clear")}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="card">
        {header}
        <div className="table-wrap">
          <table className="patients">
            <thead>
              <tr>
                <th>{t("cName")}</th>
                <th>{t("cAge")}</th>
                <th>{t("cDiagnosis")}</th>
                <th>{t("cDoctor")}</th>
                <th>{t("cLast")}</th>
                <th>{t("cProgress")}</th>
                <th>{t("cActions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty">
                      <Icon name="users" />
                      <p>{filtersActive ? t("emptyNoMatch") : t("emptyNoPatients")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                shown.map((p) => (
                  <tr
                    key={p.id}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("button")) return;
                      router.push(`/patients/${p.id}`);
                    }}
                  >
                    <td className="td-name">
                      <div className="cell-name">
                        <Avatar id={p.id} name={p.full_name} avatarUrl={p.avatar_url} size="md" />
                        <div>
                          <div className="nm">{p.full_name}</div>
                          <div className="sb">{p.guardian_name || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label={t("cAge")}>
                      {p.age} {t("years")}
                    </td>
                    <td data-label={t("cDiagnosis")}>
                      <span className="tag">{p.diagnosis}</span>
                    </td>
                    <td data-label={t("cDoctor")}>
                      <span className="doc-pill">
                        <Icon name="stetho" />
                        {p.therapist_name || "—"}
                      </span>
                    </td>
                    <td data-label={t("cLast")}>{fmtDate(p.last_session, locale)}</td>
                    <td data-label={t("cProgress")}>
                      <div className="progress">
                        <span className="pct">{p.progress}%</span>
                        <div className="bar">
                          <i style={{ width: `${p.progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="td-actions">
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          title={t("ttOpen")}
                          onClick={() => router.push(`/patients/${p.id}`)}
                        >
                          <Icon name="folder" />
                        </button>
                        {canManage && (
                          <>
                            <button className="icon-btn" title={t("ttEdit")} onClick={() => openEdit(p)}>
                              <Icon name="edit" />
                            </button>
                            <button
                              className="icon-btn danger"
                              title={t("ttDelete")}
                              onClick={() => setConfirmTarget(p)}
                            >
                              <Icon name="trash" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {compact && hasMore ? (
          <div className="show-more">
            <button onClick={() => setShowAll(true)}>
              {t("showMore")} <Icon name="chevDown" />
            </button>
          </div>
        ) : compact && showAll && filtered.length > 4 ? (
          <div className="show-more">
            <button onClick={() => setShowAll(false)}>
              {t("showLess")} <Icon name="chevUp" />
            </button>
          </div>
        ) : null}
      </div>

      {modalOpen && (
        <PatientModal
          patient={editing}
          therapists={therapists}
          onClose={() => setModalOpen(false)}
        />
      )}
      {confirmTarget && (
        <ConfirmDialog
          danger
          title={t("archiveTitle")}
          message={ti("archiveMsg", confirmTarget.full_name)}
          confirmLabel={t("confirmYes")}
          pending={pending}
          onConfirm={doArchive}
          onClose={() => setConfirmTarget(null)}
        />
      )}
    </>
  );
}
