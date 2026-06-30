import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth";

// Landing: route by role. Therapists → dashboard, parents → their child's file.
export default async function Home() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  redirect(profile.role === "parent" ? "/child" : "/dashboard");
}
