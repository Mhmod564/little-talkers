"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { Modal } from "@/components/ui/Modal";
import {
  addNote,
  updateProgress,
  updatePlan,
  addSession,
  updateSession,
  writeSummary,
  addRecording,
} from "@/app/actions/clinical";
import { uploadFile } from "@/app/actions/files";
import { todayISO, fmtDate, fmtTime, monthShort } from "@/lib/format";
import type { SessionRow } from "@/lib/types";
import { useI18n, useToast } from "@/providers/hooks";

function splitDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = iso.slice(0, 10);
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
  return { date, time };
}

function Foot({
  pending,
  label,
  onClose,
}: {
  pending: boolean;
  label: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="modal-foot">
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "..." : label}
      </button>
      <button type="button" className="btn btn-ghost" onClick={onClose}>
        {t("cancel")}
      </button>
    </div>
  );
}

function useSubmit(onClose: () => void) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(action: () => Promise<{ success: boolean; error?: string }>, okMsg: string, toast: (m: string) => void) {
    setError(null);
    setPending(true);
    const res = await action();
    setPending(false);
    if (res.success) {
      toast(okMsg);
      onClose();
      router.refresh();
    } else {
      setError(res.error ? t(res.error) : "");
    }
  }
  return { pending, error, run };
}

export function NoteModal({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { pending, error, run } = useSubmit(onClose);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(() => addNote({ patientId, date: fd.get("date"), text: fd.get("text") }), t("tNoteAdded"), toast);
  }
  return (
    <Modal title={t("mNote")} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label>{t("fSessionDate")}</label>
            <div className="control">
              <input name="date" type="date" defaultValue={todayISO()} required />
            </div>
          </div>
          <div className="field">
            <label>{t("fNote")}</label>
            <div className="control">
              <textarea name="text" required placeholder={t("phNote")} />
            </div>
          </div>
        </div>
        <Foot pending={pending} label={t("btnSaveNote")} onClose={onClose} />
      </form>
    </Modal>
  );
}

export function ProgressModal({
  patientId,
  current,
  onClose,
}: {
  patientId: string;
  current: number;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { pending, error, run } = useSubmit(onClose);
  const [val, setVal] = useState(current);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    run(() => updateProgress({ patientId, progress: val }), t("tProgressUpdated"), toast);
  }
  return (
    <Modal title={t("mProgress")} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label>{t("fProgressPct")}</label>
            <div className="range-row">
              <input
                type="range"
                min={0}
                max={100}
                value={val}
                onChange={(e) => setVal(+e.target.value)}
              />
              <span className="rv">{val}%</span>
            </div>
          </div>
        </div>
        <Foot pending={pending} label={t("save")} onClose={onClose} />
      </form>
    </Modal>
  );
}

export function PlanModal({
  patientId,
  current,
  onClose,
}: {
  patientId: string;
  current: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { pending, error, run } = useSubmit(onClose);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(() => updatePlan({ patientId, plan: fd.get("plan") }), t("tPlanSaved"), toast);
  }
  return (
    <Modal title={t("mPlan")} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label>{t("fPlanLabel")}</label>
            <div className="control">
              <textarea name="plan" style={{ minHeight: 130 }} defaultValue={current} placeholder={t("phPlan")} />
            </div>
          </div>
        </div>
        <Foot pending={pending} label={t("btnSavePlan")} onClose={onClose} />
      </form>
    </Modal>
  );
}

export function SessionModal({
  patientId,
  patients,
  session,
  onClose,
}: {
  patientId?: string;
  patients?: { id: string; full_name: string }[];
  session?: SessionRow | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { pending, error, run } = useSubmit(onClose);
  const init = session ? splitDateTime(session.scheduled_at) : { date: todayISO(), time: "10:00" };
  const needPicker = !patientId && !!patients;
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const target = patientId ?? String(fd.get("patientId") ?? "");
    const base = { patientId: target, date: fd.get("date"), time: fd.get("time"), title: fd.get("title") };
    run(
      () => (session ? updateSession({ ...base, id: session.id }) : addSession(base)),
      t("tSessionSaved"),
      toast,
    );
  }
  return (
    <Modal title={session ? t("mEditSession") : t("mAddSession")} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}
          {needPicker && (
            <div className="field">
              <label>{t("fPatient")}</label>
              <div className="control">
                <select name="patientId" required>
                  {patients!.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div className="grid-2">
            <div className="field">
              <label>{t("fDate")}</label>
              <div className="control">
                <input name="date" type="date" required defaultValue={init.date} />
              </div>
            </div>
            <div className="field">
              <label>{t("fTime")}</label>
              <div className="control">
                <input name="time" type="time" defaultValue={init.time} />
              </div>
            </div>
          </div>
          <div className="field">
            <label>{t("fSessionTitle")}</label>
            <div className="control">
              <input name="title" defaultValue={session?.title ?? ""} placeholder={t("phSessionTitle")} />
            </div>
          </div>
        </div>
        <Foot pending={pending} label={t("save")} onClose={onClose} />
      </form>
    </Modal>
  );
}

export function RecordingModal({
  patientId,
  patients,
  onClose,
}: {
  patientId?: string;
  patients?: { id: string; full_name: string }[];
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { pending, error, run } = useSubmit(onClose);
  const needPicker = !patientId && !!patients;
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const target = patientId ?? String(fd.get("patientId") ?? "");
    run(
      () => addRecording({ patientId: target, title: fd.get("title"), date: fd.get("date"), url: fd.get("url") }),
      t("tRecAdded"),
      toast,
    );
  }
  return (
    <Modal title={t("mAddRec")} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}
          {needPicker && (
            <div className="field">
              <label>{t("fPatient")}</label>
              <div className="control">
                <select name="patientId" required>
                  {patients!.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div className="grid-2">
            <div className="field">
              <label>{t("fTitle")}</label>
              <div className="control">
                <input name="title" placeholder={t("phRecTitle")} />
              </div>
            </div>
            <div className="field">
              <label>{t("fDate")}</label>
              <div className="control">
                <input name="date" type="date" defaultValue={todayISO()} required />
              </div>
            </div>
          </div>
          <div className="field">
            <label>{t("fVideoLink")}</label>
            <div className="control">
              <Icon name="video" />
              <input name="url" type="url" required placeholder="https://..." />
            </div>
          </div>
          <div className="login-hint">
            <Icon name="bulb" /> {t("recHint")}
          </div>
        </div>
        <Foot pending={pending} label={t("save")} onClose={onClose} />
      </form>
    </Modal>
  );
}

export function UploadModal({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [chosen, setChosen] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doUpload() {
    if (!chosen) return;
    setError(null);
    setPending(true);
    const fd = new FormData();
    fd.set("patientId", patientId);
    fd.set("file", chosen);
    const res = await uploadFile(fd);
    setPending(false);
    if (res.success) {
      toast(t("tFileUploaded"));
      onClose();
      router.refresh();
    } else {
      setError(t(res.error));
    }
  }

  return (
    <Modal title={t("mUpload")} onClose={onClose}>
      <div className="modal-body">
        {error && <div className="form-error">{error}</div>}
        <label className="dropzone">
          <Icon name="upload" />
          <div>
            <b>{t("dzTitle")}</b>
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{t("dzSub")}</div>
          <input
            type="file"
            hidden
            onChange={(e) => setChosen(e.target.files?.[0] ?? null)}
          />
        </label>
        {chosen && (
          <div style={{ marginTop: 12, fontWeight: 700, color: "var(--primary)" }}>
            {chosen.name}
          </div>
        )}
      </div>
      <div className="modal-foot">
        <button className="btn btn-primary" disabled={!chosen || pending} onClick={doUpload}>
          {pending ? "..." : t("btnUploadFile")}
        </button>
        <button className="btn btn-ghost" onClick={onClose}>
          {t("cancel")}
        </button>
      </div>
    </Modal>
  );
}

export function SessionDetailsModal({
  patientName,
  session,
  canWrite,
  onWriteSummary,
  onClose,
}: {
  patientName: string;
  session: SessionRow;
  canWrite: boolean;
  onWriteSummary: () => void;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const statusKey = session.upcoming
    ? "statusUpcoming"
    : session.summary
      ? "statusDone"
      : "statusPending";
  const statusCls = session.upcoming ? "up" : session.summary ? "done" : "pend";
  const { date, time } = splitDateTime(session.scheduled_at);
  return (
    <Modal title={t("sessionDetails")} onClose={onClose}>
      <div className="modal-body">
        <div className="sd-head">
          <div className={`date-chip ${session.upcoming ? "" : "past"}`}>
            <b>{new Date(session.scheduled_at).getDate()}</b>
            <span>{monthShort(date, locale)}</span>
          </div>
          <div>
            <div className="sd-title">{session.title || t("sesDefault")}</div>
            <div className="sd-sub">
              <Icon name="user" /> {patientName} · <Icon name="clock" /> {time} · {fmtDate(date, locale)}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <span className={`status-tag ${statusCls}`}>{t(statusKey)}</span>
        </div>
        <div className="subhead" style={{ marginTop: 18 }}>
          <h3 style={{ fontSize: 15 }}>{t("sessionSummary")}</h3>
        </div>
        {session.summary ? (
          <div className="plan-box">{session.summary}</div>
        ) : (
          <div className="plan-box empty-plan">{t("noSummary")}</div>
        )}
      </div>
      <div className="modal-foot">
        {canWrite && (
          <button className="btn btn-primary" onClick={onWriteSummary}>
            <Icon name="edit" /> {t("writeSummaryBtn")}
          </button>
        )}
        <button className="btn btn-ghost" onClick={onClose}>
          {t("close")}
        </button>
      </div>
    </Modal>
  );
}

export function SessionSummaryModal({
  patientId,
  session,
  onClose,
}: {
  patientId: string;
  session: SessionRow;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { pending, error, run } = useSubmit(onClose);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    run(
      () => writeSummary({ patientId, id: session.id, summary: fd.get("summary") }),
      t("tSummarySaved"),
      toast,
    );
  }
  return (
    <Modal title={t("writeSummaryTitle")} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}
          <div className="login-hint" style={{ margin: "0 0 14px" }}>
            <Icon name="bulb" /> {t("writeSummaryHint")}
          </div>
          <div className="field">
            <label>{t("sessionSummary")}</label>
            <div className="control">
              <textarea
                name="summary"
                required
                style={{ minHeight: 120 }}
                defaultValue={session.summary ?? ""}
                placeholder={t("phSummary")}
              />
            </div>
          </div>
        </div>
        <Foot pending={pending} label={t("btnOk")} onClose={onClose} />
      </form>
    </Modal>
  );
}
