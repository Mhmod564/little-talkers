"use server";

import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { can } from "@/lib/permissions";
import { logActivity } from "@/lib/activity";
import { todayISO } from "@/lib/format";
import {
  CreatePatientSchema,
  UpdatePatientSchema,
} from "@/lib/zod-schemas";
import { nextUsername } from "@/lib/username";
import { ok, fail, type ActionResult } from "@/lib/types";

function revalidate() {
  revalidatePath("/patients");
  revalidatePath("/dashboard");
  revalidatePath("/removed");
}

/** Create a patient AND provision its parent account (auth user + profile). */
export async function createPatient(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const me = await getCurrentProfile();
    if (!me || !can(me.role, me.permissions, "manage_patients")) return fail();

    const parsed = CreatePatientSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      const pw = parsed.error.issues.find((i) => i.path[0] === "parentPassword");
      return fail(pw ? "pwRule" : "errBadData");
    }
    const d = parsed.data;
    const admin = createAdminClient();

    // Parent username is auto-assigned and immutable (parent<N>).
    const parentUsername = await nextUsername(admin, "parent");

    // 1) parent auth user
    const { data: created, error: authErr } = await admin.auth.admin.createUser({
      email: d.parentEmail,
      password: d.parentPassword,
      email_confirm: true,
    });
    if (authErr || !created.user) return fail("errCreateParent");
    const parentId = created.user.id;

    // 2) parent profile
    const { error: profErr } = await admin.from("profiles").insert({
      id: parentId,
      username: parentUsername,
      role: "parent",
      full_name: d.guardian,
      phone: d.phone,
    });
    if (profErr) {
      await admin.auth.admin.deleteUser(parentId); // best-effort rollback
      throw profErr;
    }

    // 3) patient
    const { data: patient, error: patErr } = await admin
      .from("patients")
      .insert({
        full_name: d.name,
        age: d.age,
        gender: d.gender,
        birth_date: d.birthDate,
        guardian_name: d.guardian,
        phone: d.phone,
        diagnosis: d.diagnosis,
        therapist_id: d.therapistId,
        parent_id: parentId,
        progress: 0,
        last_session: todayISO(),
      })
      .select("id")
      .single();
    if (patErr || !patient) throw patErr ?? new Error("insert patient failed");

    await logActivity(admin, {
      actorId: me.id,
      actorName: me.full_name,
      actionKey: "aAddPatient",
      kind: "patient",
      patientId: patient.id,
      meta: { name: d.name },
    });

    revalidate();
    return ok({ id: patient.id });
  } catch (err) {
    console.error("[createPatient]", err);
    return fail();
  }
}

/** Update patient fields (and the linked parent's basic credentials). */
export async function updatePatient(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const me = await getCurrentProfile();
    if (!me || !can(me.role, me.permissions, "manage_patients")) return fail();

    const parsed = UpdatePatientSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      const pw = parsed.error.issues.find((i) => i.path[0] === "parentPassword");
      return fail(pw ? "pwRule" : "errBadData");
    }
    const d = parsed.data;
    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("patients")
      .select("parent_id")
      .eq("id", d.id)
      .maybeSingle<{ parent_id: string | null }>();

    const { error: upErr } = await admin
      .from("patients")
      .update({
        full_name: d.name,
        age: d.age,
        gender: d.gender,
        birth_date: d.birthDate,
        guardian_name: d.guardian,
        phone: d.phone,
        diagnosis: d.diagnosis,
        therapist_id: d.therapistId,
      })
      .eq("id", d.id);
    if (upErr) throw upErr;

    if (existing?.parent_id) {
      // username is immutable; only name/phone (and optionally email/password) change
      await admin
        .from("profiles")
        .update({ full_name: d.guardian, phone: d.phone })
        .eq("id", existing.parent_id);
      if (d.parentPassword) {
        await admin.auth.admin.updateUserById(existing.parent_id, {
          password: d.parentPassword,
        });
      }
      if (d.parentEmail) {
        await admin.auth.admin.updateUserById(existing.parent_id, {
          email: d.parentEmail,
        });
      }
    }

    await logActivity(admin, {
      actorId: me.id,
      actorName: me.full_name,
      actionKey: "aEditPatient",
      kind: "patient",
      patientId: d.id,
      meta: { name: d.name },
    });

    revalidate();
    revalidatePath(`/patients/${d.id}`);
    return ok({ id: d.id });
  } catch (err) {
    console.error("[updatePatient]", err);
    return fail();
  }
}

async function setDeleted(id: string, deleted: boolean): Promise<ActionResult> {
  const me = await getCurrentProfile();
  if (!me || !can(me.role, me.permissions, "manage_patients")) return fail();
  const admin = createAdminClient();
  const { data: p } = await admin
    .from("patients")
    .select("full_name")
    .eq("id", id)
    .maybeSingle<{ full_name: string }>();
  const { error } = await admin
    .from("patients")
    .update({ deleted_at: deleted ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
  await logActivity(admin, {
    actorId: me.id,
    actorName: me.full_name,
    actionKey: deleted ? "aDelPatient" : "tRestored",
    kind: deleted ? "remove" : "patient",
    patientId: id,
    meta: { name: p?.full_name ?? "" },
  });
  revalidate();
  return ok(null);
}

export async function archivePatient(id: string): Promise<ActionResult> {
  try {
    return await setDeleted(id, true);
  } catch (err) {
    console.error("[archivePatient]", err);
    return fail();
  }
}

export async function restorePatient(id: string): Promise<ActionResult> {
  try {
    return await setDeleted(id, false);
  } catch (err) {
    console.error("[restorePatient]", err);
    return fail();
  }
}

export async function deletePatientForever(id: string): Promise<ActionResult> {
  try {
    const me = await getCurrentProfile();
    if (!me || !can(me.role, me.permissions, "manage_patients")) return fail();
    const admin = createAdminClient();
    const { data: p } = await admin
      .from("patients")
      .select("full_name")
      .eq("id", id)
      .maybeSingle<{ full_name: string }>();
    const { error } = await admin.from("patients").delete().eq("id", id);
    if (error) throw error;
    await logActivity(admin, {
      actorId: me.id,
      actorName: me.full_name,
      actionKey: "aDelPatient",
      kind: "remove",
      patientId: null,
      meta: { name: p?.full_name ?? "" },
    });
    revalidate();
    return ok(null);
  } catch (err) {
    console.error("[deletePatientForever]", err);
    return fail();
  }
}
