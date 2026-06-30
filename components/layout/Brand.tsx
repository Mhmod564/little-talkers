"use client";

import Link from "next/link";

import { Icon } from "@/components/icons";
import { useI18n, type DictKey } from "@/providers/hooks";

/** Logo + product name + sub-label. Clickable when `homeHref` is provided. */
export function Brand({
  subKey,
  homeHref,
}: {
  subKey: DictKey;
  homeHref?: string;
}) {
  const { t } = useI18n();
  const inner = (
    <>
      <div className="logo-mark">
        <Icon name="logo" />
      </div>
      <div className="logo-text">
        <strong>Little Talkers</strong>
        <span>{t(subKey)}</span>
      </div>
    </>
  );

  if (homeHref) {
    return (
      <Link className="logo logo-link" href={homeHref} title={t("goHome")}>
        {inner}
      </Link>
    );
  }
  return <div className="logo">{inner}</div>;
}
