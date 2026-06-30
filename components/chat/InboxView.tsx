"use client";

import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { fmtDateTime } from "@/lib/format";
import type { InboxItem } from "@/lib/data/messages";
import { useI18n } from "@/providers/hooks";

export function InboxView({ items }: { items: InboxItem[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();

  return (
    <div className="card">
      <div className="subhead">
        <h3>{t("inboxTitle")}</h3>
        <span className="count">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="empty"><Icon name="message" /><p>{t("inboxEmpty")}</p></div>
      ) : (
        <div className="inbox-list">
          {items.map((it) => (
            <button
              className="inbox-item"
              key={it.patient_id}
              onClick={() => router.push(`/inbox/${it.patient_id}`)}
            >
              <Avatar id={it.patient_id} name={it.patient_name} size="md" />
              <div className="inbox-main">
                <div className="it-top">
                  <b>{it.guardian_name || t("lblParent")}</b>
                  <span className="it-time">{fmtDateTime(it.last_at, locale)}</span>
                </div>
                <div className="it-prev">{it.patient_name} · {it.last_body}</div>
              </div>
              {it.unread > 0 && <span className="ibadge">{it.unread}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
