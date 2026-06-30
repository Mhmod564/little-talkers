"use client";

import { Icon, type IconName } from "@/components/icons";
import { useI18n, type DictKey } from "@/providers/hooks";

/** Temporary section placeholder used until each phase ports the real view. */
export function Placeholder({
  icon,
  labelKey,
}: {
  icon: IconName;
  labelKey: DictKey;
}) {
  const { t } = useI18n();
  return (
    <div className="card">
      <div className="empty">
        <Icon name={icon} />
        <p>{t(labelKey)}</p>
      </div>
    </div>
  );
}
