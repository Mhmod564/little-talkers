import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Shell, type NavItem } from "@/components/layout/Shell";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "parent") redirect("/dashboard");

  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("id, full_name")
    .eq("parent_id", profile.id)
    .is("deleted_at", null)
    .maybeSingle<{ id: string; full_name: string }>();

  const nav: NavItem[] = [
    { key: "child", icon: "home", labelKey: "nMyChild", href: "/child" },
    { key: "chat", icon: "chat", labelKey: "nChat", href: "/chat" },
  ];

  return (
    <Shell
      variant="parent"
      brandSubKey="subParent"
      homeHref="/child"
      user={{ id: profile.id, name: profile.full_name, avatarUrl: profile.avatar_url }}
      patientName={patient?.full_name ?? ""}
      nav={nav}
    >
      {children}
    </Shell>
  );
}
