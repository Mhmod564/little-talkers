"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/icons";
import { useI18n } from "@/providers/hooks";

export function BackToTop() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      id="to-top"
      className={show ? "show" : ""}
      title={t("toTop")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <Icon name="arrowUp" />
    </button>
  );
}
