import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listInbox } from "@/lib/data/messages";
import { Shell, type NavItem } from "@/components/layout/Shell";

export default async function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role === "parent") redirect("/child");

  const { role, permissions } = profile;

  const nav: NavItem[] = [
    { key: "dashboard", icon: "home", labelKey: "nDash", href: "/dashboard" },
    { key: "myprofile", icon: "user", labelKey: "nMyProfile", href: "/profile" },
    { key: "patients", icon: "users", labelKey: "nPatients", href: "/patients" },
    { key: "sessions", icon: "calendar", labelKey: "nSessions", href: "/sessions" },
    { key: "recordings", icon: "video", labelKey: "nRecordings", href: "/recordings" },
  ];
  if (can(role, permissions, "chat")) {
    const inbox = await listInbox();
    const unread = inbox.reduce((n, i) => n + i.unread, 0);
    nav.push({ key: "inbox", icon: "message", labelKey: "nInbox", href: "/inbox", badge: unread || undefined });
  }
  if (can(role, permissions, "view_reports"))
    nav.push({ key: "reports", icon: "report", labelKey: "nReports", href: "/reports" });
  if (can(role, permissions, "view_log"))
    nav.push({ key: "log", icon: "history", labelKey: "nLog", href: "/log" });
  if (role === "main_therapist")
    nav.push({ key: "doctors", icon: "stetho", labelKey: "nDoctors", href: "/doctors" });
  if (can(role, permissions, "manage_patients"))
    nav.push({ key: "removed", icon: "trash", labelKey: "nRemoved", href: "/removed" });

  return (
    <Shell
      variant="therapist"
      brandSubKey="subTher"
      homeHref="/dashboard"
      user={{ id: profile.id, name: profile.full_name, avatarUrl: profile.avatar_url }}
      subTitle={profile.title ?? ""}
      isMain={role === "main_therapist"}
      greetingName={profile.full_name}
      nav={nav}
    >
      {children}
    </Shell>
  );
}
