"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { sendMessage, markChatRead } from "@/app/actions/chat";
import { fmtTime } from "@/lib/format";
import type { ChatMessage } from "@/lib/data/messages";
import { useI18n, useToast } from "@/providers/hooks";

export function ChatPanel({
  patientId,
  meRole,
  myName,
  headName,
  headSub,
  initialMessages,
}: {
  patientId: string;
  meRole: "therapist" | "parent";
  myName: string;
  headName: string;
  headSub: string;
  initialMessages: ChatMessage[];
}) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // reconcile with server data when it changes
  useEffect(() => setMessages(initialMessages), [initialMessages]);

  // mark the other party's messages read on open
  useEffect(() => {
    const hasUnread = initialMessages.some(
      (m) => m.sender_role !== meRole && !m.read_at,
    );
    if (hasUnread) markChatRead(patientId).then(() => router.refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    // optimistic
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      patient_id: patientId,
      sender_role: meRole,
      sender_id: null,
      sender_name: myName,
      body,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    setText("");
    const res = await sendMessage({ patientId, body });
    setSending(false);
    if (res.success) router.refresh();
    else {
      toast(res.error, "err");
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
    }
  }

  return (
    <div className="card chat-card">
      <div className="chat-head-bar">
        <div className="ch-id">
          <div className="ava md">{initials(headName)}</div>
          <div>
            <div className="chn">{headName}</div>
            <div className="chs">{headSub}</div>
          </div>
        </div>
      </div>

      <div className="chat-body" ref={bodyRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            <Icon name="chat" />
            <p>{t("chEmpty")}</p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`chat-bubble ${m.sender_role === meRole ? "mine" : "theirs"}`}>
              <p>{m.body}</p>
              <span className="cb-time">
                {m.sender_name} · {fmtTime(m.created_at, locale)}
              </span>
            </div>
          ))
        )}
      </div>

      <form className="chat-form" onSubmit={onSubmit}>
        <input
          autoComplete="off"
          placeholder={t("chPlaceholder")}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={sending}>
          <Icon name="send" />
        </button>
      </form>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}
