"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { restorePatient, deletePatientForever } from "@/app/actions/patients";
import { fmtDate } from "@/lib/format";
import type { PatientListItem } from "@/lib/data/patients";
import { useI18n, useToast } from "@/providers/hooks";

export function RemovedView({ patients }: { patients: PatientListItem[] }) {
  const { t, ti, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [target, setTarget] = useState<PatientListItem | null>(null);
  const [pending, setPending] = useState(false);

  async function onRestore(p: PatientListItem) {
    const res = await restorePatient(p.id);
    if (res.success) {
      toast(t("tRestored"));
      router.refresh();
    } else toast(res.error, "err");
  }
  async function onDeleteForever() {
    if (!target) return;
    setPending(true);
    const res = await deletePatientForever(target.id);
    setPending(false);
    setTarget(null);
    if (res.success) {
      toast(t("tArchived"));
      router.refresh();
    } else toast(res.error, "err");
  }

  return (
    <div className="card">
      {patients.length === 0 ? (
        <div className="empty">
          <Icon name="trash" />
          <p>{t("emptyRemoved")}</p>
        </div>
      ) : (
        <div className="doctor-list">
          {patients.map((p) => (
            <div className="doctor-item" key={p.id}>
              <Avatar id={p.id} name={p.full_name} avatarUrl={p.avatar_url} size="md" />
              <div className="doctor-main">
                <div className="dn">{p.full_name}</div>
                <div className="ds">
                  {p.diagnosis || "—"} · {p.therapist_name || "—"}
                </div>
              </div>
              <div className="row-actions">
                <button className="btn btn-soft btn-sm" onClick={() => onRestore(p)}>
                  <Icon name="history" /> {t("restore")}
                </button>
                <button className="icon-btn danger" title={t("deleteForever")} onClick={() => setTarget(p)}>
                  <Icon name="trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {target && (
        <ConfirmDialog
          danger
          title={t("delForeverTitle")}
          message={ti("delForeverMsg", target.full_name)}
          confirmLabel={t("deleteForever")}
          pending={pending}
          onConfirm={onDeleteForever}
          onClose={() => setTarget(null)}
        />
      )}
    </div>
  );
}
