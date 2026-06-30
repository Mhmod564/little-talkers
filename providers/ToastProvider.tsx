"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { Icon } from "@/components/icons";
import { useI18n } from "@/providers/I18nProvider";

type ToastKind = "ok" | "err";
type ToastItem = { id: string; msg: string; kind: ToastKind; leaving: boolean };

type ToastValue = { toast: (msg: string, kind?: ToastKind) => void };
const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const { t } = useI18n();

  const toast = useCallback((msg: string, kind: ToastKind = "ok") => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, msg, kind, leaving: false }]);
    // mirror the prototype timings: start leaving at 2.4s, remove at 2.75s
    setTimeout(() => {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, leaving: true } : it)),
      );
    }, 2400);
    setTimeout(() => {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }, 2750);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div id="toast-root">
        {items.map((it) => (
          <div
            key={it.id}
            className={`toast ${it.kind}`}
            style={
              it.leaving
                ? { opacity: 0, transform: "translateY(10px)", transition: "all .3s" }
                : undefined
            }
          >
            <Icon name={it.kind === "err" ? "x" : "check"} />
            {/* msg may be a dict KEY (action errors) or already-translated text
                (success toasts); translate() is a safe no-op for the latter. */}
            <span>{t(it.msg)}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
