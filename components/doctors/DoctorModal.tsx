"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { Modal } from "@/components/ui/Modal";
import { createDoctor, updateDoctor } from "@/app/actions/doctors";
import { previewNextUsername } from "@/app/actions/usernames";
import { ALL_PERMS, PERM_LABEL } from "@/lib/permissions";
import type { DoctorItem } from "@/lib/data/doctors";
import { useI18n, useToast } from "@/providers/hooks";

export function DoctorModal({
  doctor,
  onClose,
}: {
  doctor: DoctorItem | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const editing = !!doctor;
  const isMain = doctor?.role === "main_therapist";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // for a new account, show the username that will be auto-assigned
  const [autoUser, setAutoUser] = useState(doctor?.username ?? "");
  useEffect(() => {
    if (!editing) previewNextUsername("therapist").then(setAutoUser);
  }, [editing]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = editing ? await updateDoctor(fd) : await createDoctor(fd);
    setPending(false);
    if (res.success) {
      toast(t(editing ? "tDoctorUpdated" : "tDoctorCreated2"));
      onClose();
      router.refresh();
    } else setError(t(res.error));
  }

  const checked = (k: string) =>
    !editing || (doctor?.permissions ? !!doctor.permissions[k as keyof typeof doctor.permissions] : false);

  return (
    <Modal title={editing ? t("mEditDoctor") : t("mAddDoctor")} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div className="modal-body">
          {editing && <input type="hidden" name="id" value={doctor.id} />}
          {error && <div className="form-error">{error}</div>}
          <div className="grid-2">
            <Field label={t("fDocName")}>
              <input name="name" required defaultValue={doctor?.full_name ?? ""} placeholder={t("phDocName")} />
            </Field>
            <Field label={t("fTitleRole")}>
              <input name="title" defaultValue={doctor?.title ?? ""} placeholder={t("phTitleRole")} />
            </Field>
            <Field label={t("username")} icon="user">
              <input
                disabled
                readOnly
                value={autoUser}
                placeholder={t("autoUsernameNew")}
              />
            </Field>
            <Field label={t("password")} icon="lock">
              <input name="password" type="password" required={!editing} maxLength={10} placeholder="••••••" autoComplete="new-password" />
            </Field>
            <Field label={t("lblEmail")} icon="message">
              <input name="email" type="email" required={!editing} placeholder={t("phEmail")} />
            </Field>
          </div>
          <div className="login-hint" style={{ marginTop: 6 }}>
            <Icon name="user" /> {t("autoUsername")}
          </div>
          <div className="login-hint" style={{ marginTop: 6 }}>
            <Icon name="lock" /> {t("pwRule")}
          </div>
          <div className="login-hint" style={{ marginTop: 6 }}>
            <Icon name="message" /> {t("emailHint")}
          </div>

          {isMain ? (
            <div className="login-hint" style={{ marginTop: 10 }}>
              <Icon name="shield" /> {t("mainAllPerms")}
            </div>
          ) : (
            <>
              <div className="subhead" style={{ marginTop: 10 }}>
                <h3 style={{ fontSize: 15 }}>{t("secPerms")}</h3>
              </div>
              <div className="perm-grid">
                {ALL_PERMS.map((k) => (
                  <label className="perm-row" key={k}>
                    <input type="checkbox" name={`perm_${k}`} defaultChecked={checked(k)} />
                    <span>{t(PERM_LABEL[k])}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="modal-foot">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "..." : editing ? t("btnSaveChanges") : t("btnCreateAcc")}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t("cancel")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: React.ReactNode;
  icon?: "user" | "lock" | "message";
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="control">
        {icon && <Icon name={icon} />}
        {children}
      </div>
    </div>
  );
}
