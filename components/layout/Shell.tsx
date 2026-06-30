"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Icon, type IconName } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { Brand } from "@/components/layout/Brand";
import { LangSwitcher } from "@/components/layout/LangSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { IdleLogout } from "@/components/layout/IdleLogout";
import { signOut } from "@/app/actions/auth";
import { useI18n, type DictKey } from "@/providers/hooks";

export type NavItem = {
  key: string;
  icon: IconName;
  labelKey: DictKey;
  href: string;
  badge?: number;
};

// pathname → topbar title key (mirrors the prototype `titles` map).
const TITLE_BY_PATH: Record<string, DictKey> = {
  "/dashboard": "nDash",
  "/patients": "nPatients",
  "/sessions": "nSessions",
  "/recordings": "nRecordings",
  "/reports": "nReports",
  "/log": "nLog",
  "/doctors": "nDoctors",
  "/removed": "nRemoved",
  "/profile": "nMyProfile",
  "/inbox": "nInbox",
  "/child": "nMyChild",
  "/chat": "nChat",
};

export function Shell({
  variant,
  brandSubKey,
  homeHref,
  user,
  nav,
  greetingName,
  subTitle,
  isMain,
  patientName,
  children,
}: {
  variant: "therapist" | "parent";
  brandSubKey: DictKey;
  homeHref: string;
  user: { id: string; name: string; avatarUrl?: string | null };
  nav: NavItem[];
  greetingName?: string;
  subTitle?: string;
  isMain?: boolean;
  patientName?: string;
  children: React.ReactNode;
}) {
  const { t, ti } = useI18n();

  const subLabel =
    variant === "parent"
      ? ti("chSubDoctor", patientName ?? "")
      : `${subTitle ?? ""}${isMain ? " · " + t("roleMain") : ""}`;
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("nav-open-lock", navOpen);
    return () => document.body.classList.remove("nav-open-lock");
  }, [navOpen]);

  // close the drawer on navigation
  useEffect(() => setNavOpen(false), [pathname]);

  const titleKey =
    pathname.startsWith("/patients/") && pathname.length > "/patients/".length
      ? "titleProfile"
      : pathname.startsWith("/inbox/")
        ? "nChat"
        : TITLE_BY_PATH[pathname] ?? "nDash";

  const isActive = (href: string) =>
    pathname === href ||
    (href === "/patients" && pathname.startsWith("/patients/")) ||
    (href === "/inbox" && pathname.startsWith("/inbox/"));

  async function handleLogout() {
    await signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className={`shell ${navOpen ? "nav-open" : ""}`}>
      <IdleLogout />
      <div className="scrim" onClick={() => setNavOpen(false)} />

      <aside className="sidebar">
        <button
          className="icon-btn nav-close"
          title={t("close")}
          onClick={() => setNavOpen(false)}
        >
          <Icon name="x" />
        </button>
        <Brand subKey={brandSubKey} homeHref={homeHref} />

        <div className="sidebar-user">
          <Avatar id={user.id} name={user.name} avatarUrl={user.avatarUrl} size="md" />
          <div className="meta">
            <strong>{user.name}</strong>
            <span>{subLabel}</span>
          </div>
        </div>

        <nav className="nav">
          {nav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? "active" : ""}`}
            >
              <Icon name={item.icon} />
              <span>{t(item.labelKey)}</span>
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </Link>
          ))}
          <div className="nav-spacer" />
          <ThemeToggle variant="nav" />
          <button className="nav-item logout" onClick={handleLogout}>
            <Icon name="logout" />
            <span>{t("nLogout")}</span>
          </button>
        </nav>
      </aside>

      <div className="main">
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="icon-btn hamburger"
              onClick={() => setNavOpen(true)}
            >
              <Icon name="menu" />
            </button>
            <div className="page-title">{t(titleKey)}</div>
          </div>
          <div className="right">
            {greetingName && (
              <span className="greet">
                {t("hello")} <b>{greetingName}</b>
              </span>
            )}
            <LangSwitcher />
            {variant === "parent" ? (
              <span className="ro-badge">
                <Icon name="eye" /> {t("badgeReadonly")}
              </span>
            ) : (
              <Avatar id={user.id} name={user.name} avatarUrl={user.avatarUrl} size="md" />
            )}
          </div>
        </div>
        <div className="content" id="content">
          {children}
        </div>
      </div>
    </div>
  );
}
