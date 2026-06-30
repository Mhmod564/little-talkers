import { Icon } from "@/components/icons";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getChat } from "@/lib/data/messages";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { translate } from "@/lib/i18n";

export default async function ParentChatPage() {
  const me = await getCurrentProfile();
  if (!me) return null;

  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("id, full_name, therapist:profiles!therapist_id(full_name)")
    .eq("parent_id", me.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!patient) {
    return (
      <div className="card">
        <div className="empty"><Icon name="chat" /><p>—</p></div>
      </div>
    );
  }

  const tj = patient.therapist as { full_name: string } | { full_name: string }[] | null;
  const therapistName = Array.isArray(tj) ? tj[0]?.full_name : tj?.full_name;
  const messages = await getChat(patient.id);

  return (
    <ChatPanel
      patientId={patient.id}
      meRole="parent"
      myName={me.full_name}
      headName={therapistName ?? translate(0, "chSubParent")}
      headSub={translate(0, "chSubParent")}
      initialMessages={messages}
    />
  );
}
