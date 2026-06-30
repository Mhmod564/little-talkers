"use server";

import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { SendMessageSchema } from "@/lib/zod-schemas";
import { ok, fail, type ActionResult } from "@/lib/types";

/** Send a chat message. RLS enforces that only the parent / assigned therapist can. */
export async function sendMessage(input: {
  patientId: string;
  body: string;
}): Promise<ActionResult> {
  try {
    const me = await getCurrentProfile();
    if (!me) return fail();
    const parsed = SendMessageSchema.safeParse(input);
    if (!parsed.success) return fail("errMsgInvalid");
    const { patientId, body } = parsed.data;

    const supabase = await createClient();
    const senderRole = me.role === "parent" ? "parent" : "therapist";
    const { error } = await supabase.from("messages").insert({
      patient_id: patientId,
      sender_role: senderRole,
      sender_id: me.id,
      body,
    });
    if (error) throw error;

    // log only therapist->parent (parents aren't therapists; RLS blocks their log insert)
    if (senderRole === "therapist") {
      await logActivity(supabase, {
        actorId: me.id,
        actorName: me.full_name,
        actionKey: "chatLogLabel",
        kind: "message",
        patientId,
        meta: { body },
      });
    }

    revalidatePath("/chat");
    revalidatePath("/inbox");
    revalidatePath(`/patients/${patientId}`);
    return ok(null);
  } catch (err) {
    console.error("[sendMessage]", err);
    return fail();
  }
}

/** Mark the other party's messages as read for a patient's thread. */
export async function markChatRead(patientId: string): Promise<ActionResult> {
  try {
    const me = await getCurrentProfile();
    if (!me) return fail();
    const otherRole = me.role === "parent" ? "therapist" : "parent";
    const supabase = await createClient();
    const { error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("patient_id", patientId)
      .eq("sender_role", otherRole)
      .is("read_at", null);
    if (error) throw error;
    revalidatePath("/chat");
    revalidatePath("/inbox");
    return ok(null);
  } catch (err) {
    console.error("[markChatRead]", err);
    return fail();
  }
}
