"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { updateMyProfile } from "@/app/actions/doctors";
import type { DoctorItem } from "@/lib/data/doctors";
import { useI18n, useToast } from "@/providers/hooks";

export function MyProfileView({ me }: { me: DoctorItem }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await updateMyProfile(new FormData(e.currentTarget));
    setPending(false);
    if (res.success) {
      toast(t("tProfileSaved"));
      setEditing(false);
      router.refresh();
    } else setError(t(res.error));
  }

  return (
    <>
      <div className="card">
        <div className="profile-hero">
          <Avatar id={me.id} name={me.full_name} avatarUrl={me.avatar_url} size="lg" />
          <div className="info">
            <h2>{me.full_name}</h2>
            <div className="meta-row">
              <span><Icon name="stetho" /> {me.title || "—"}</span>
              <span><Icon name="phone2" /> {me.phone || "—"}</span>
              {me.age ? <span><Icon name="cake" /> {me.age} {t("years")}</span> : null}
              <span><Icon name="user" /> {t("lblUser")}: {me.username}</span>
              {me.role === "main_therapist" && <span><Icon name="shield" /> {t("roleMain")}</span>}
            </div>
          </div>
          <div className="profile-actions">
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              <Icon name="edit" /> {t("myProfileEdit")}
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="subhead"><h3>{t("bioLabel")}</h3></div>
        {me.bio ? (
          <div className="plan-box bio-box">{me.bio}</div>
        ) : (
          <div className="plan-box empty-plan">{t("noBio")}</div>
        )}
      </div>

      {editing && (
        <Modal title={t("myProfileEdit")} onClose={() => setEditing(false)}>
          <form onSubmit={onSubmit}>
            <div className="modal-body">
              {error && <div className="form-error">{error}</div>}
              <div className="field">
                <label>{t("fDocName")}</label>
                <div className="control">
                  <input name="name" required defaultValue={me.full_name} placeholder={t("phDocName")} />
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>{t("lblPhone")}</label>
                  <div className="control"><input name="phone" defaultValue={me.phone ?? ""} placeholder="05xxxxxxxx" /></div>
                </div>
                <div className="field">
                  <label>{t("cAge")}</label>
                  <div className="control"><input name="age" type="number" min={18} max={100} defaultValue={me.age ?? ""} /></div>
                </div>
              </div>
              <div className="field">
                <label>{t("fTitleRole")}</label>
                <div className="control"><input name="title" defaultValue={me.title ?? ""} placeholder={t("phTitleRole")} /></div>
              </div>
              <div className="field">
                <label>{t("bioLabel")}</label>
                <div className="control">
                  <textarea name="bio" style={{ minHeight: 130 }} defaultValue={me.bio ?? ""} />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button type="submit" className="btn btn-primary" disabled={pending}>
                {pending ? "..." : t("saveProfile")}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                {t("cancel")}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
