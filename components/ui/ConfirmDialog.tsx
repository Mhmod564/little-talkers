"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/icons";
import { useI18n } from "@/providers/hooks";

/** Centered confirm dialog (ports the prototype confirmDialog). */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger,
  pending,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      className="modal-scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal sm">
        <div className="modal-body" style={{ textAlign: "center", paddingTop: 26 }}>
          <div className={`confirm-ico ${danger ? "danger" : ""}`}>
            <Icon name={danger ? "trash" : "check"} />
          </div>
          <h3 style={{ margin: "14px 0 6px" }}>{title}</h3>
          <p style={{ color: "var(--text-soft)", margin: 0, lineHeight: 1.8 }}>
            {message}
          </p>
        </div>
        <div className="modal-foot" style={{ justifyContent: "center" }}>
          <button
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            disabled={pending}
            onClick={onConfirm}
          >
            {confirmLabel || t("confirm")}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
