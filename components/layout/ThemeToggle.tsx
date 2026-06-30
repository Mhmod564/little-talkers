"use client";

import { Icon } from "@/components/icons";
import { useI18n, useTheme } from "@/providers/hooks";

/** `icon` = round button (login topbar); `nav` = sidebar nav row. */
export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "nav" }) {
  const { dark, toggle } = useTheme();
  const { t } = useI18n();

  if (variant === "nav") {
    return (
      <button className="nav-item" onClick={toggle}>
        <Icon name={dark ? "sun" : "moon"} />
        <span>{dark ? t("darkOff") : t("darkOn")}</span>
      </button>
    );
  }
  return (
    <button
      className="icon-btn"
      onClick={toggle}
      title={dark ? t("darkOff") : t("darkOn")}
    >
      <Icon name={dark ? "sun" : "moon"} />
    </button>
  );
}
