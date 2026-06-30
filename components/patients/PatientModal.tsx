"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { Modal } from "@/components/ui/Modal";
import { createPatient, updatePatient } from "@/app/actions/patients";
import { previewNextUsername } from "@/app/actions/usernames";
import type { PatientListItem, TherapistOption } from "@/lib/data/patients";
import { useI18n, useToast } from "@/providers/hooks";

export function PatientModal({
  patient,
  therapists,
  onClose,
}: {
  patient: PatientListItem | null;
  therapists: TherapistOption[];
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const editing = !!patient;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // for a new patient, show the parent username that will be auto-assigned
  const [autoUser, setAutoUser] = useState(patient?.parent_username ?? "");
  useEffect(() => {
    if (!editing) previewNextUsername("parent").then(setAutoUser);
  }, [editing]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const res = editing
      ? await updatePatient(fd)
      : await createPatient(fd);
    setPending(false);
    if (res.success) {
      toast(t(editing ? "tSaved" : "tPatientAdded"));
      onClose();
      router.refresh();
      if (!editing) router.push(`/patients/${res.data.id}`);
    } else {
      setError(t(res.error));
    }
  }

  const req = (label: string) => (
    <>
      {label} <span className="req">*</span>
    </>
  );

  return (
    <Modal title={editing ? t("mEditPatient") : t("mAddPatient")} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div className="modal-body">
          {editing && <input type="hidden" name="id" value={patient.id} />}
          {error && <div className="form-error">{error}</div>}
          <div className="grid-2">
            <Field label={req(t("fFullName"))}>
              <input name="name" required defaultValue={patient?.full_name ?? ""} placeholder={t("phName")} />
            </Field>
            <Field label={req(t("cAge"))}>
              <input name="age" type="number" min={1} max={18} required defaultValue={patient?.age ?? ""} placeholder="7" />
            </Field>
            <Field label={req(t("lblGender"))}>
              <select name="gender" defaultValue={patient?.gender === "female" ? "female" : "male"}>
                <option value="male">{t("gMale")}</option>
                <option value="female">{t("gFemale")}</option>
              </select>
            </Field>
            <Field label={req(t("cDoctor"))}>
              <select name="therapistId" defaultValue={patient?.therapist_id ?? therapists[0]?.id ?? ""}>
                {therapists.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={req(t("fBirth"))}>
              <input name="birthDate" type="date" required defaultValue={patient?.birth_date ?? ""} />
            </Field>
            <Field label={req(t("fGuardian"))}>
              <input name="guardian" required defaultValue={patient?.guardian_name ?? ""} placeholder={t("fGuardian")} />
            </Field>
            <Field label={req(t("lblPhone"))}>
              <input name="phone" required defaultValue={patient?.phone ?? ""} placeholder="05xxxxxxxx" />
            </Field>
            <Field label={req(t("cDiagnosis"))}>
              <input name="diagnosis" required defaultValue={patient?.diagnosis ?? ""} placeholder={t("phDiagnosis")} />
            </Field>
          </div>

          <div style={{ height: 8 }} />
          <div className="subhead">
            <h3 style={{ fontSize: 15 }}>{t("secParentLogin")}</h3>
          </div>
          <div className="grid-2">
            <Field label={t("username")} icon="user">
              <input
                disabled
                readOnly
                value={autoUser}
                placeholder={t("autoUsernameNew")}
              />
            </Field>
            <Field label={editing ? t("password") : req(t("password"))} icon="lock">
              <input
                name="parentPassword"
                type="password"
                required={!editing}
                maxLength={10}
                autoComplete="new-password"
                placeholder={editing ? "••••" : "••••"}
              />
            </Field>
            <Field label={editing ? "Email" : req("Email")} icon="message">
              <input
                name="parentEmail"
                type="email"
                required={!editing}
                placeholder="parent@example.com"
              />
            </Field>
          </div>
          <div className="login-hint" style={{ marginTop: 6 }}>
            <Icon name="user" /> {t("autoUsername")}
          </div>
          <div className="login-hint" style={{ marginTop: 6 }}>
            <Icon name="lock" /> {t("pwRule")}
          </div>
        </div>

        <div className="modal-foot">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "..." : editing ? t("btnSaveChanges") : t("btnAddPatient2")}
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
