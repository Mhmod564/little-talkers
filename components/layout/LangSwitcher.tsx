"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/icons";
import { LANGS, DISPLAY_ORDER } from "@/lib/i18n";
import { useI18n } from "@/providers/hooks";

export function LangSwitcher() {
  const { L, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open]);

  return (
    <div className="lang-switch" ref={ref}>
      <button
        className="lang-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <Icon name="globe" />
        <span>{LANGS[L]!.short}</span>
      </button>
      <div className="lang-menu" hidden={!open}>
        {DISPLAY_ORDER.map((i) => (
          <button
            key={i}
            className={i === L ? "on" : ""}
            onClick={() => {
              setLang(i);
              setOpen(false);
            }}
          >
            {LANGS[i]!.native}
          </button>
        ))}
      </div>
    </div>
  );
}
