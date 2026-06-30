import { Icon } from "@/components/icons";
import Link from "next/link";

import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getChat } from "@/lib/data/messages";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { translate } from "@/lib/i18n";

export default async function TherapistChatPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const me = await getCurrentProfile();
  if (!me) return null;

  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("id, full_name, guardian_name")
    .eq("id", patientId)
    .maybeSingle<{ id: string; full_name: string; guardian_name: string | null }>();

  if (!patient) {
    return (
      <div className="card">
        <div className="empty"><Icon name="chat" /><p>—</p></div>
      </div>
    );
  }

  const messages = await getChat(patientId);

  return (
    <>
      <Link className="back-link" href="/inbox">
        <Icon name="arrowBack" /> {translate(0, "back")}
      </Link>
      <ChatPanel
        patientId={patientId}
        meRole="therapist"
        myName={me.full_name}
        headName={patient.guardian_name || translate(0, "lblParent")}
        headSub={patient.full_name}
        initialMessages={messages}
      />
    </>
  );
}
