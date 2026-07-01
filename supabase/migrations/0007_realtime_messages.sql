-- 0007: Enable Supabase Realtime for chat so new messages stream to the other
-- participant live (no page refresh). RLS still applies to realtime, so only
-- chat participants receive a patient's messages (via messages_select /
-- chat_participant()).
alter publication supabase_realtime add table public.messages;
