"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon, type IconName } from "@/components/icons";
import { fmtDateTime } from "@/lib/format";
import type { LogItem } from "@/lib/data/logs";
import type { DictKey } from "@/providers/hooks";
import { useI18n } from "@/providers/hooks";

const KIND_ICON: Record<string, IconName> = {
  note: "edit",
  progress: "activity",
  plan: "bulb",
  file: "file",
  patient: "user",
  remove: "trash",
  session: "calendar",
  doctor: "stetho",
  perms: "key",
  recording: "video",
  message: "message",
  info: "history",
};

const KIND_LABEL: Record<string, DictKey> = {
  note: "kNote",
  progress: "kProgress",
  plan: "kPlan",
  file: "kFile",
  patient: "kPatient",
  remove: "kRemove",
  session: "kSession",
  doctor: "kDoctor",
  perms: "kPerms",
  recording: "kRecording",
  message: "kMessage",
};

export function LogView({
  logs,
  doctors,
}: {
  logs: LogItem[];
  doctors: { id: string; full_name: string }[];
}) {
  const { t, locale, code } = useI18n();
  const router = useRouter();
  const L = code === "he" ? 0 : code === "ar" ? 1 : 2;
  const [doctor, setDoctor] = useState("");
  const [kind, setKind] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const describe = (l: LogItem): string => {
    const arg = l.meta && typeof l.meta === "object" ? (l.meta as Record<string, unknown>)["arg"] : undefined;
    const base = t(l.action_key as DictKey);
    return arg != null ? base.replace("{0}", String(arg)) : base;
  };

  const list = useMemo(() => {
    let out = logs.slice();
    if (doctor) out = out.filter((l) => l.actor_id === doctor);
    if (kind) out = out.filter((l) => l.kind === kind);
    const q = search.trim();
    if (q)
      out = out.filter(
        (l) =>
          describe(l).includes(q) ||
          (l.patient_name ?? "").includes(q) ||
          (l.actor_name ?? "").includes(q),
      );
    if (from) out = out.filter((l) => l.created_at.slice(0, 10) >= from);
    if (to) out = out.filter((l) => l.created_at.slice(0, 10) <= to);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, doctor, kind, search, from, to, L]);

  const active = !!(doctor || kind || search || from || to);

  return (
    <div className="card">
      <div className="toolbar tb-section">
        <div className="search tb-search">
          <Icon name="search" />
          <input placeholder={t("phSearchLog")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="tb-filters">
          <label className="fsel">
            <Icon name="filter" />
            <select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
              <option value="">{t("allDoctors")}</option>
              {doctors.map((d) => (<option key={d.id} value={d.id}>{d.full_name}</option>))}
            </select>
          </label>
          <label className="fsel">
            <Icon name="filter" />
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="">{t("allKinds")}</option>
              {Object.entries(KIND_LABEL).map(([k, label]) => (
                <option key={k} value={k}>{t(label)}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="tb-daterange">
          <div className="field dr-field">
            <label>{t("fromDate")}</label>
            <div className="control"><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          </div>
          <div className="field dr-field">
            <label>{t("toDate")}</label>
            <div className="control"><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          </div>
        </div>
        {active && (
          <div className="tb-clear">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setDoctor(""); setKind(""); setSearch(""); setFrom(""); setTo(""); }}
            >
              <Icon name="x" /> {t("clear")}
            </button>
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <div className="empty"><Icon name="history" /><p>{t("emptyNoEvents")}</p></div>
      ) : (
        <div className="log-list">
          {list.map((l) => (
            <div
              key={l.id}
              className={`log-item ${l.patient_id ? "clickable" : ""}`}
              onClick={l.patient_id ? () => router.push(`/patients/${l.patient_id}`) : undefined}
            >
              <div className="log-ico"><Icon name={KIND_ICON[l.kind ?? "info"] ?? "history"} /></div>
              <div className="log-main">
                <div className="lt">
                  <b>{l.actor_name}</b> {describe(l)}
                  {l.patient_name ? <> — <span className="lp">{l.patient_name}</span></> : null}
                </div>
                <div className="ls"><Icon name="clock" /> {fmtDateTime(l.created_at, locale)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
