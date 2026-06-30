import { listInbox } from "@/lib/data/messages";
import { InboxView } from "@/components/chat/InboxView";

export default async function InboxPage() {
  const items = await listInbox();
  return <InboxView items={items} />;
}
