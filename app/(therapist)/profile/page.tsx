import { redirect } from "next/navigation";

import { getMyDoctor } from "@/lib/data/doctors";
import { MyProfileView } from "@/components/profile/MyProfileView";

export default async function MyProfilePage() {
  const me = await getMyDoctor();
  if (!me) redirect("/login");
  return <MyProfileView me={me} />;
}
