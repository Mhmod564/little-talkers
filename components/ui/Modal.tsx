"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/icons";

/** Portal modal with scrim + Esc/scrim close (ports the prototype openModal). */
export function Modal({
  title,
  onClose,
  children,
  size,
}: {
  title?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm";
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="modal-scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal ${size === "sm" ? "sm" : ""}`}>
        {title && (
          <div className="modal-head">
            <h3>{title}</h3>
            <button className="icon-btn" onClick={onClose}>
              <Icon name="x" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
