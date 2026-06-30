"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PatientModal } from "@/components/patients/PatientModal";
import {
  NoteModal,
  ProgressModal,
  PlanModal,
  SessionModal,
  RecordingModal,
  UploadModal,
  SessionDetailsModal,
  SessionSummaryModal,
} from "@/components/modals/clinical";
import { archivePatient } from "@/app/actions/patients";
import { updateChildBasics } from "@/app/actions/parent";
import { deleteNote, deleteSession, deleteRecording } from "@/app/actions/clinical";
import { deleteFile, getFileUrl } from "@/app/actions/files";
import { Modal } from "@/components/ui/Modal";
import { fmtDate, fmtSize, genderText, monthShort } from "@/lib/format";
import type { PatientClinical } from "@/lib/data/clinical";
import type { PatientDetail, PatientListItem, TherapistOption } from "@/lib/data/patients";
import type { Caps, SessionRow } from "@/lib/types";
import { useI18n, useToast } from "@/providers/hooks";

type ModalState =
  | { type: "none" }
  | { type: "edit" }
  | { type: "remove" }
  | { type: "note" }
  | { type: "progress" }
  | { type: "plan" }
  | { type: "upload" }
  | { type: "recording" }
  | { type: "session"; session: SessionRow | null }
  | { type: "sessionDetails"; session: SessionRow }
  | { type: "sessionSummary"; session: SessionRow }
  | { type: "meetTherapist" }
  | { type: "editChild" };

export function PatientProfile({
  detail,
  clinical,
  therapists,
  caps,
  readonly = false,
  therapistInfo = null,
  parentCanChat = false,
  therapistCanChat = false,
}: {
  detail: PatientDetail;
  clinical: PatientClinical;
  therapists: TherapistOption[];
  caps: Caps;
  readonly?: boolean;
  therapistInfo?: { name: string; title: string | null; bio: string | null } | null;
  parentCanChat?: boolean;
  therapistCanChat?: boolean;
}) {
  const { t, ti, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [pending, setPending] = useState(false);
  const close = () => setModal({ type: "none" });

  const canEdit = !readonly && caps.manage_patients;
  const canNotes = !readonly && caps.manage_notes;
  const canSessions = !readonly && caps.manage_sessions;
  const canFiles = !readonly && caps.manage_files;
  const canRec = !readonly && caps.manage_recordings;

  const upcoming = clinical.sessions.filter((s) => s.upcoming);
  const past = clinical.sessions.filter((s) => !s.upcoming).reverse();

  const ringC = 2 * Math.PI * 54;
  const dash = ringC * (1 - detail.progress / 100);

  const asListItem: PatientListItem = {
    id: detail.id,
    full_name: detail.full_name,
    age: detail.age,
    gender: detail.gender,
    birth_date: detail.birth_date,
    phone: detail.phone,
    diagnosis: detail.diagnosis,
    progress: detail.progress,
    last_session: detail.last_session,
    guardian_name: detail.guardian_name,
    avatar_url: detail.avatar_url,
    therapist_id: detail.therapist_id,
    therapist_name: detail.therapist_name,
    parent_username: detail.parent_username,
  };

  async function refresh(msg: string) {
    toast(msg);
    router.refresh();
  }
  async function doArchive() {
    setPending(true);
    const res = await archivePatient(detail.id);
    setPending(false);
    close();
    if (res.success) {
      toast(t("tArchived"));
      router.push("/patients");
      router.refresh();
    } else toast(res.error, "err");
  }
  async function onDeleteNote(id: string) {
    const res = await deleteNote({ patientId: detail.id, id });
    res.success ? refresh(t("tNoteDeleted")) : toast(res.error, "err");
  }
  async function onDeleteSession(id: string) {
    const res = await deleteSession({ patientId: detail.id, id });
    res.success ? refresh(t("tSessionDeleted")) : toast(res.error, "err");
  }
  async function onDeleteRec(id: string) {
    const res = await deleteRecording({ patientId: detail.id, id });
    res.success ? refresh(t("tRecDeleted")) : toast(res.error, "err");
  }
  async function onDeleteFile(id: string) {
    const res = await deleteFile({ patientId: detail.id, id });
    res.success ? refresh(t("tFileDeleted")) : toast(res.error, "err");
  }
  async function onDownload(storagePath: string, name: string) {
    const res = await getFileUrl(storagePath);
    if (res.success) {
      toast(ti("tDownloading", name));
      window.open(res.data.url, "_blank", "noopener");
    } else toast(res.error, "err");
  }

  const sessionItem = (s: SessionRow) => {
    const { time } = { time: new Date(s.scheduled_at).toTimeString().slice(0, 5) };
    return (
      <div
        key={s.id}
        className="session-item clickable"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          setModal({ type: "sessionDetails", session: s });
        }}
      >
        <div className={`date-chip ${s.upcoming ? "" : "past"}`}>
          <b>{new Date(s.scheduled_at).getDate()}</b>
          <span>{monthShort(s.scheduled_at, locale)}</span>
        </div>
        <div className="session-main">
          <div className="st">
            {s.title || t("sesDefault")}
            {s.pending ? (
              <span className="need-sum"> {t("needsSummary")}</span>
            ) : s.summary ? (
              <span className="done-tag">
                {" "}
                <Icon name="check" />
              </span>
            ) : null}
          </div>
          <div className="ss">
            <Icon name="clock" /> {time} · {fmtDate(s.scheduled_at, locale)}
          </div>
        </div>
        {canSessions && (
          <div className="row-actions">
            <button
              className="icon-btn"
              title={t("ttEdit")}
              onClick={() => setModal({ type: "session", session: s })}
            >
              <Icon name="edit" />
            </button>
            <button
              className="icon-btn danger"
              title={t("ttDelete")}
              onClick={() => onDeleteSession(s.id)}
            >
              <Icon name="trash" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {!readonly && (
        <button className="back-link" onClick={() => router.push("/patients")}>
          <Icon name="arrowBack" /> {t("back")}
        </button>
      )}

      <div className="card">
        <div className="profile-hero">
          <Avatar id={detail.id} name={detail.full_name} avatarUrl={detail.avatar_url} size="lg" />
          <div className="info">
            <h2>{detail.full_name}</h2>
            <div className="meta-row">
              <span><Icon name="cake" /> {detail.age ?? "—"} {t("years")}</span>
              <span><Icon name="user" /> {genderText(detail.gender, t)}</span>
              <span><Icon name="activity" /> {detail.diagnosis || "—"}</span>
              <span><Icon name="stetho" /> {detail.therapist_name || "—"}</span>
              <span><Icon name="clock" /> {t("lastSessionLbl")}: {fmtDate(detail.last_session, locale)}</span>
            </div>
          </div>
          <div className="profile-actions">
            {!readonly && therapistCanChat && (
              <button className="btn btn-soft" onClick={() => router.push(`/inbox/${detail.id}`)}>
                <Icon name="chat" /> {t("actChat")}
              </button>
            )}
            {canNotes && (
              <button className="btn btn-primary" onClick={() => setModal({ type: "note" })}>
                <Icon name="plus" /> {t("actNote")}
              </button>
            )}
            {canEdit && (
              <button className="btn btn-soft" onClick={() => setModal({ type: "edit" })}>
                <Icon name="edit" /> {t("ttEdit")}
              </button>
            )}
            {canEdit && (
              <button className="btn btn-danger" onClick={() => setModal({ type: "remove" })}>
                <Icon name="trash" /> {t("ttDelete")}
              </button>
            )}
            {readonly && (
              <>
                {parentCanChat && (
                  <button className="btn btn-primary" onClick={() => router.push("/chat")}>
                    <Icon name="chat" /> {t("actChatTher")}
                  </button>
                )}
                <button className="btn btn-soft" onClick={() => setModal({ type: "meetTherapist" })}>
                  <Icon name="stetho" /> {t("meetTherapist")}
                </button>
                <button className="btn btn-soft" onClick={() => setModal({ type: "editChild" })}>
                  <Icon name="edit" /> {t("actEditDetails")}
                </button>
                <span className="ro-badge editable">
                  <Icon name="user" /> {t("badgeParent")}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="stack">
          <div className="card">
            <div className="subhead"><h3>{t("secInfo")}</h3></div>
            <div className="info-grid">
              {([
                ["user", t("lblParent"), detail.guardian_name || "—"],
                ["phone2", t("lblPhone"), detail.phone || "—"],
                ["cake", t("cAge"), `${detail.age ?? "—"} ${t("years")}`],
                ["calendar", t("lblBirth"), detail.birth_date ? fmtDate(detail.birth_date, locale) : "—"],
                ["user", t("lblGender"), genderText(detail.gender, t)],
                ["activity", t("cDiagnosis"), detail.diagnosis || "—"],
                ["stetho", t("cDoctor"), detail.therapist_name || "—"],
                ["clock", t("lastSessionLbl"), fmtDate(detail.last_session, locale)],
              ] as const).map(([ic, k, v], i) => (
                <div className="info-row" key={i}>
                  <div className="info-ic"><Icon name={ic} /></div>
                  <div className="info-txt"><div className="k">{k}</div><div className="v">{v}</div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="subhead">
              <h3>{t("secUpcoming")}</h3><span className="count">{upcoming.length}</span><span className="grow" />
              {canSessions && (
                <button className="btn btn-soft btn-sm" onClick={() => setModal({ type: "session", session: null })}>
                  <Icon name="plus" /> {t("btnScheduleShort")}
                </button>
              )}
            </div>
            {upcoming.length === 0 ? (
              <div className="empty"><Icon name="calendar" /><p>{t("emptyUpcomingP")}</p></div>
            ) : (
              <div className="session-list">{upcoming.map(sessionItem)}</div>
            )}
          </div>

          <div className="card">
            <div className="subhead"><h3>{t("sesPast")}</h3><span className="count">{past.length}</span></div>
            {past.length === 0 ? (
              <div className="empty"><Icon name="clock" /><p>{t("emptyPast")}</p></div>
            ) : (
              <div className="session-list muted">{past.map(sessionItem)}</div>
            )}
          </div>

          <div className="card">
            <div className="subhead">
              <h3>{t("secRecordings")}</h3><span className="count">{clinical.recordings.length}</span><span className="grow" />
              {canRec && (
                <button className="btn btn-soft btn-sm" onClick={() => setModal({ type: "recording" })}>
                  <Icon name="plus" /> {t("btnAdd")}
                </button>
              )}
            </div>
            {clinical.recordings.length === 0 ? (
              <div className="empty"><Icon name="video" /><p>{t("emptyRecP")}</p></div>
            ) : (
              <div className="rec-list">
                {clinical.recordings.map((r) => (
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
                    {canRec && (
                      <button className="icon-btn danger" title={t("ttDelete")} onClick={() => onDeleteRec(r.id)}>
                        <Icon name="trash" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="subhead">
              <h3>{t("secNotes")}</h3><span className="count">{clinical.notes.length}</span><span className="grow" />
              {canNotes && (
                <button className="btn btn-soft btn-sm" onClick={() => setModal({ type: "note" })}>
                  <Icon name="plus" /> {t("btnAdd")}
                </button>
              )}
            </div>
            {clinical.notes.length === 0 ? (
              <div className="empty"><Icon name="edit" /><p>{t("emptyNotes")}</p></div>
            ) : (
              <div className="timeline">
                {clinical.notes.map((n) => (
                  <div className="note-item" key={n.id}>
                    <div className="nh">
                      <span className="date"><Icon name="calendar" /> {fmtDate(n.session_date, locale)}</span>
                      {canNotes && (
                        <button className="icon-btn btn-sm del" title={t("ttDelete")} onClick={() => onDeleteNote(n.id)}>
                          <Icon name="trash" />
                        </button>
                      )}
                    </div>
                    <p>{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="subhead">
              <h3>{t("secProgress")}</h3><span className="grow" />
              {canEdit && (
                <button className="icon-btn btn-sm" title={t("ttEdit")} onClick={() => setModal({ type: "progress" })}>
                  <Icon name="edit" />
                </button>
              )}
            </div>
            <div className="progress-big">
              <div className="ring">
                <svg width="132" height="132">
                  <circle cx="66" cy="66" r="54" fill="none" stroke="#eceef5" strokeWidth="12" />
                  <circle cx="66" cy="66" r="54" fill="none" stroke="#7c6fd6" strokeWidth="12" strokeLinecap="round" strokeDasharray={ringC.toFixed(1)} strokeDashoffset={dash.toFixed(1)} />
                </svg>
                <div className="num">{detail.progress}%</div>
              </div>
              <div className="lbl">{t("progressLbl")}</div>
            </div>
          </div>

          <div className="card">
            <div className="subhead">
              <h3>{t("secPlan")}</h3><span className="grow" />
              {canEdit && (
                <button className="icon-btn btn-sm" title={t("ttEdit")} onClick={() => setModal({ type: "plan" })}>
                  <Icon name="edit" />
                </button>
              )}
            </div>
            {detail.plan ? (
              <div className="plan-box">{detail.plan}</div>
            ) : (
              <div className="plan-box empty-plan">{t("emptyPlan")}</div>
            )}
          </div>

          <div className="card">
            <div className="subhead">
              <h3>{t("secFiles")}</h3><span className="count">{clinical.files.length}</span><span className="grow" />
              {canFiles && (
                <button className="btn btn-soft btn-sm" onClick={() => setModal({ type: "upload" })}>
                  <Icon name="upload" /> {t("btnUpload")}
                </button>
              )}
            </div>
            {clinical.files.length === 0 ? (
              <div className="empty"><Icon name="file" /><p>{t("emptyFilesP")}</p></div>
            ) : (
              <div className="file-list">
                {clinical.files.map((f) => (
                  <div className="file-item" key={f.id}>
                    <div className="file-ico"><Icon name="file" /></div>
                    <div className="file-meta">
                      <div className="fn">{f.name}</div>
                      <div className="fs">{fmtSize(f.size)} · {fmtDate(f.created_at, locale)}</div>
                    </div>
                    <button className="icon-btn" title={t("ttDownload")} onClick={() => onDownload(f.storage_path, f.name)}>
                      <Icon name="download" />
                    </button>
                    {canFiles && (
                      <button className="icon-btn danger" title={t("ttDelete")} onClick={() => onDeleteFile(f.id)}>
                        <Icon name="trash" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {canEdit && (
            <div className="card">
              <div className="subhead"><h3>{t("secParentAcc")}</h3></div>
              <div className="credentials">
                <div className="crow">
                  <span className="k">{t("username")}</span>
                  <span className="v">{detail.parent_username || "—"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modal.type === "edit" && (
        <PatientModal patient={asListItem} therapists={therapists} onClose={close} />
      )}
      {modal.type === "remove" && (
        <ConfirmDialog
          danger
          title={t("archiveTitle")}
          message={ti("archiveMsg", detail.full_name)}
          confirmLabel={t("confirmYes")}
          pending={pending}
          onConfirm={doArchive}
          onClose={close}
        />
      )}
      {modal.type === "note" && <NoteModal patientId={detail.id} onClose={close} />}
      {modal.type === "progress" && (
        <ProgressModal patientId={detail.id} current={detail.progress} onClose={close} />
      )}
      {modal.type === "plan" && (
        <PlanModal patientId={detail.id} current={detail.plan ?? ""} onClose={close} />
      )}
      {modal.type === "upload" && <UploadModal patientId={detail.id} onClose={close} />}
      {modal.type === "recording" && <RecordingModal patientId={detail.id} onClose={close} />}
      {modal.type === "session" && (
        <SessionModal patientId={detail.id} session={modal.session} onClose={close} />
      )}
      {modal.type === "sessionDetails" && (
        <SessionDetailsModal
          patientName={detail.full_name}
          session={modal.session}
          canWrite={canSessions && !modal.session.upcoming}
          onWriteSummary={() => setModal({ type: "sessionSummary", session: modal.session })}
          onClose={close}
        />
      )}
      {modal.type === "sessionSummary" && (
        <SessionSummaryModal patientId={detail.id} session={modal.session} onClose={close} />
      )}
      {modal.type === "meetTherapist" && (
        <Modal title={t("docProfileTitle")} onClose={close}>
          <div className="modal-body" style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
              <Avatar id={detail.therapist_id ?? "x"} name={therapistInfo?.name ?? detail.therapist_name ?? "—"} size="lg" />
            </div>
            <h3 style={{ margin: "6px 0 2px" }}>{therapistInfo?.name ?? detail.therapist_name ?? "—"}</h3>
            <p style={{ color: "var(--text-soft)", margin: "0 0 12px" }}>{therapistInfo?.title ?? "—"}</p>
            <div style={{ textAlign: "start" }}>
              {therapistInfo?.bio ? (
                <div className="plan-box bio-box">{therapistInfo.bio}</div>
              ) : (
                <div className="plan-box empty-plan">{t("noBio")}</div>
              )}
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={close}>{t("close")}</button>
          </div>
        </Modal>
      )}
      {modal.type === "editChild" && (
        <ChildEditModal detail={detail} onClose={close} />
      )}
    </>
  );
}

function ChildEditModal({
  detail,
  onClose,
}: {
  detail: PatientDetail;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await updateChildBasics(new FormData(e.currentTarget));
    setPending(false);
    if (res.success) {
      toast(t("tDetailsUpdated"));
      onClose();
      router.refresh();
    } else setError(t(res.error));
  }

  return (
    <Modal title={t("mEditBasic")} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div className="modal-body">
          <input type="hidden" name="id" value={detail.id} />
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label>{t("fChildName")}</label>
            <div className="control">
              <input name="name" required defaultValue={detail.full_name} placeholder={t("fFullName")} />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>{t("fPhoneNum")}</label>
              <div className="control"><input name="phone" defaultValue={detail.phone ?? ""} placeholder="05xxxxxxxx" /></div>
            </div>
            <div className="field">
              <label>{t("cAge")}</label>
              <div className="control"><input name="age" type="number" min={1} max={18} defaultValue={detail.age ?? ""} /></div>
            </div>
          </div>
          <div className="field">
            <label>{t("lblBirth")}</label>
            <div className="control"><input name="birthDate" type="date" defaultValue={detail.birth_date ?? ""} /></div>
          </div>
          <div className="login-hint"><Icon name="bulb" /> {t("parentEditHint")}</div>
        </div>
        <div className="modal-foot">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "..." : t("save")}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>{t("cancel")}</button>
        </div>
      </form>
    </Modal>
  );
}
