"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DoctorModal } from "@/components/doctors/DoctorModal";
import {
  softDeleteDoctor,
  restoreDoctor,
  deleteDoctorForever,
} from "@/app/actions/doctors";
import { ALL_PERMS, PERM_LABEL } from "@/lib/permissions";
import { fmtDate } from "@/lib/format";
import type { DoctorItem } from "@/lib/data/doctors";
import { useI18n, useToast } from "@/providers/hooks";

type ModalState =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit"; doctor: DoctorItem }
  | { type: "remove"; doctor: DoctorItem }
  | { type: "perma"; doctor: DoctorItem };

export function DoctorsView({ doctors }: { doctors: DoctorItem[] }) {
  const { t, ti, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [pending, setPending] = useState(false);
  const close = () => setModal({ type: "none" });

  const q = search.trim();
  const active = useMemo(
    () =>
      doctors
        .filter((d) => d.is_active)
        .filter((d) => !q || d.full_name.includes(q) || d.username.includes(q)),
    [doctors, q],
  );
  const removed = useMemo(
    () =>
      doctors
        .filter((d) => !d.is_active)
        .filter((d) => !q || d.full_name.includes(q) || d.username.includes(q)),
    [doctors, q],
  );

  async function run(fn: () => Promise<{ success: boolean; error?: string }>, okMsg: string) {
    setPending(true);
    const res = await fn();
    setPending(false);
    close();
    if (res.success) {
      toast(okMsg);
      router.refresh();
    } else toast(res.error ?? "", "err");
  }

  const permChips = (d: DoctorItem) => {
    const keys = d.role === "main_therapist" ? ALL_PERMS : ALL_PERMS.filter((k) => d.permissions?.[k]);
    if (!keys.length) return <span className="perm-chip none">{t("permNone")}</span>;
    return keys.map((k) => (
      <span className="perm-chip" key={k}>{t(PERM_LABEL[k])}</span>
    ));
  };

  return (
    <>
      <div className="card">
        <div className="toolbar tb-patients">
          <button className="btn btn-primary tb-action" onClick={() => setModal({ type: "add" })}>
            <Icon name="plus" /> {t("btnAddDoctor")}
          </button>
          <div className="search tb-search">
            <Icon name="search" />
            <input
              placeholder={t("phSearchDoctor")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="doctor-list">
          {active.map((d) => (
            <div className="doctor-item" key={d.id}>
              <Avatar id={d.id} name={d.full_name} avatarUrl={d.avatar_url} size="md" />
              <div className="doctor-main">
                <div className="dn">
                  {d.full_name}{" "}
                  {d.role === "main_therapist" ? (
                    <span className="role-tag main"><Icon name="shield" /> {t("roleMain")}</span>
                  ) : (
                    <span className="role-tag">{t("roleDoc")}</span>
                  )}
                </div>
                <div className="ds">
                  {d.title || "—"} · {t("lblUser")}: <b>{d.username}</b> · {d.patient_count} {t("unitPatients")}
                </div>
                <div className="perm-chips">{permChips(d)}</div>
              </div>
              <div className="row-actions">
                <button className="icon-btn" title={t("ttEdit")} onClick={() => setModal({ type: "edit", doctor: d })}>
                  <Icon name="edit" />
                </button>
                {d.role !== "main_therapist" && (
                  <button className="icon-btn danger" title={t("ttDelete")} onClick={() => setModal({ type: "remove", doctor: d })}>
                    <Icon name="trash" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {removed.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="subhead">
            <h3>{t("removedDoctors")}</h3>
            <span className="count">{removed.length}</span>
          </div>
          <div className="doctor-list">
            {removed.map((d) => (
              <div className="doctor-item" key={d.id} style={{ opacity: 0.75 }}>
                <Avatar id={d.id} name={d.full_name} avatarUrl={d.avatar_url} size="md" />
                <div className="doctor-main">
                  <div className="dn">{d.full_name}</div>
                  <div className="ds">
                    {d.title || "—"} · {t("lblUser")}: <b>{d.username}</b>
                    {d.removed_at ? ` · ${t("removedOn")} ${fmtDate(d.removed_at, locale)}` : ""}
                  </div>
                </div>
                <div className="row-actions">
                  <button className="btn btn-soft btn-sm" onClick={() => run(() => restoreDoctor(d.id), t("tDoctorRestored"))}>
                    <Icon name="history" /> {t("restore")}
                  </button>
                  <button className="icon-btn danger" title={t("deleteForever")} onClick={() => setModal({ type: "perma", doctor: d })}>
                    <Icon name="trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(modal.type === "add" || modal.type === "edit") && (
        <DoctorModal doctor={modal.type === "edit" ? modal.doctor : null} onClose={close} />
      )}
      {modal.type === "remove" && (
        <ConfirmDialog
          danger
          title={t("delDoctorTitle")}
          message={
            modal.doctor.patient_count
              ? ti("delDoctorMsgCount", modal.doctor.patient_count)
              : ti("delDoctorMsg", modal.doctor.full_name)
          }
          confirmLabel={t("confirmYes")}
          pending={pending}
          onConfirm={() => run(() => softDeleteDoctor(modal.doctor.id), t("tDoctorDeleted"))}
          onClose={close}
        />
      )}
      {modal.type === "perma" && (
        <ConfirmDialog
          danger
          title={t("delForeverTitle")}
          message={ti("delDoctorMsg", modal.doctor.full_name)}
          confirmLabel={t("deleteForever")}
          pending={pending}
          onConfirm={() => run(() => deleteDoctorForever(modal.doctor.id), t("tDoctorDeleted"))}
          onClose={close}
        />
      )}
    </>
  );
}
