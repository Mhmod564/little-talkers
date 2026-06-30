"use server";

import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity";
import { ok, fail, type ActionResult } from "@/lib/types";

/** A parent edits their own child's BASIC details only (name, phone, birth date, age).
 *  Therapeutic data stays therapist-managed. Ownership is verified server-side. */
export async function updateChildBasics(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const me = await getCurrentProfile();
    if (!me || me.role !== "parent") return fail();

    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const birthDate = String(formData.get("birthDate") ?? "").trim();
    const ageRaw = String(formData.get("age") ?? "").trim();
    const age = ageRaw ? Number(ageRaw) : null;
    if (!id || !name) return fail("errBadData");

    const admin = createAdminClient();
    // verify this patient really belongs to the signed-in parent
    const { data: owned } = await admin
      .from("patients")
      .select("id")
      .eq("id", id)
      .eq("parent_id", me.id)
      .maybeSingle<{ id: string }>();
    if (!owned) return fail();

    const { error } = await admin
      .from("patients")
      .update({
        full_name: name,
        phone: phone || null,
        birth_date: birthDate || null,
        age: age && !Number.isNaN(age) ? age : null,
      })
      .eq("id", id);
    if (error) throw error;

    await logActivity(admin, {
      actorId: me.id,
      actorName: `${me.full_name} (${name})`,
      actionKey: "aParentEdit",
      kind: "patient",
      patientId: id,
      meta: { name },
    });

    revalidatePath("/child");
    return ok(null);
  } catch (err) {
    console.error("[updateChildBasics]", err);
    return fail();
  }
}
