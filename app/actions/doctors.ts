"use server";

import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_PERMS } from "@/lib/permissions";
import { logActivity } from "@/lib/activity";
import { CreateDoctorSchema, UpdateDoctorSchema } from "@/lib/zod-schemas";
import { nextUsername } from "@/lib/username";
import { ok, fail, type ActionResult, type Permissions } from "@/lib/types";

function revalidate() {
  revalidatePath("/doctors");
  revalidatePath("/patients");
  revalidatePath("/dashboard");
}

/** Build a permissions object from `perm_<key>` checkbox fields in the form. */
function readPerms(formData: FormData): Permissions {
  const perms = {} as Permissions;
  for (const k of ALL_PERMS) perms[k] = formData.get(`perm_${k}`) != null;
  return perms;
}

/** main-therapist only: create a therapist account (auth user + profile). */
export async function createDoctor(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const me = await getCurrentProfile();
    if (!me || me.role !== "main_therapist") return fail();

    const parsed = CreateDoctorSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      const pw = parsed.error.issues.find((i) => i.path[0] === "password");
      return fail(pw ? "pwRule" : "errBadData");
    }
    const d = parsed.data;
    const admin = createAdminClient();

    // Username is auto-assigned and immutable (therapist<N>), never user-chosen.
    const username = await nextUsername(admin, "therapist");

    const { data: created, error: authErr } = await admin.auth.admin.createUser({
      email: d.email,
      password: d.password,
      email_confirm: true,
    });
    if (authErr || !created.user) return fail("errCreateAcc");

    const { error: profErr } = await admin.from("profiles").insert({
      id: created.user.id,
      username,
      role: "therapist",
      full_name: d.name,
      title: d.title || null,
      permissions: readPerms(formData),
      is_active: true,
    });
    if (profErr) {
      await admin.auth.admin.deleteUser(created.user.id);
      throw profErr;
    }

    await logActivity(admin, {
      actorId: me.id,
      actorName: me.full_name,
      actionKey: "aCreateDoc",
      kind: "doctor",
      meta: { arg: d.name },
    });

    revalidate();
    return ok({ id: created.user.id });
  } catch (err) {
    console.error("[createDoctor]", err);
    return fail();
  }
}

/** main-therapist only: edit a therapist's details, permissions, and credentials. */
export async function updateDoctor(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const me = await getCurrentProfile();
    if (!me || me.role !== "main_therapist") return fail();

    const parsed = UpdateDoctorSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      const pw = parsed.error.issues.find((i) => i.path[0] === "password");
      return fail(pw ? "pwRule" : "errBadData");
    }
    const d = parsed.data;
    const admin = createAdminClient();

    const { data: target } = await admin
      .from("profiles")
      .select("role")
      .eq("id", d.id)
      .maybeSingle<{ role: string }>();

    // Username is immutable — the main therapist can change the password and
    // details, but never the auto-assigned username.
    const patch: Record<string, unknown> = {
      full_name: d.name,
      title: d.title || null,
    };
    // never strip the main therapist's permissions
    if (target?.role !== "main_therapist") patch.permissions = readPerms(formData);

    const { error: upErr } = await admin.from("profiles").update(patch).eq("id", d.id);
    if (upErr) throw upErr;

    if (d.password) await admin.auth.admin.updateUserById(d.id, { password: d.password });
    if (d.email) await admin.auth.admin.updateUserById(d.id, { email: d.email });

    await logActivity(admin, {
      actorId: me.id,
      actorName: me.full_name,
      actionKey: "aEditDoc",
      kind: "perms",
      meta: { arg: d.name },
    });

    revalidate();
    return ok({ id: d.id });
  } catch (err) {
    console.error("[updateDoctor]", err);
    return fail();
  }
}

/** Soft-delete a therapist: reassign their patients to main, deactivate the account. */
export async function softDeleteDoctor(id: string): Promise<ActionResult> {
  try {
    const me = await getCurrentProfile();
    if (!me || me.role !== "main_therapist") return fail();
    const admin = createAdminClient();

    const { data: target } = await admin
      .from("profiles")
      .select("full_name, role")
      .eq("id", id)
      .maybeSingle<{ full_name: string; role: string }>();
    if (!target || target.role === "main_therapist") return fail();

    // move patients to the main therapist
    await admin.from("patients").update({ therapist_id: me.id }).eq("therapist_id", id);
    const { error } = await admin.from("profiles").update({ is_active: false }).eq("id", id);
    if (error) throw error;

    await logActivity(admin, {
      actorId: me.id,
      actorName: me.full_name,
      actionKey: "aDelDoc",
      kind: "doctor",
      meta: { arg: target.full_name },
    });

    revalidate();
    return ok(null);
  } catch (err) {
    console.error("[softDeleteDoctor]", err);
    return fail();
  }
}

export async function restoreDoctor(id: string): Promise<ActionResult> {
  try {
    const me = await getCurrentProfile();
    if (!me || me.role !== "main_therapist") return fail();
    const admin = createAdminClient();
    const { data: target } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", id)
      .maybeSingle<{ full_name: string }>();
    const { error } = await admin.from("profiles").update({ is_active: true }).eq("id", id);
    if (error) throw error;
    await logActivity(admin, {
      actorId: me.id,
      actorName: me.full_name,
      actionKey: "aRestoreDoc",
      kind: "doctor",
      meta: { arg: target?.full_name ?? "" },
    });
    revalidate();
    return ok(null);
  } catch (err) {
    console.error("[restoreDoctor]", err);
    return fail();
  }
}

export async function deleteDoctorForever(id: string): Promise<ActionResult> {
  try {
    const me = await getCurrentProfile();
    if (!me || me.role !== "main_therapist") return fail();
    const admin = createAdminClient();

    const { data: target } = await admin
      .from("profiles")
      .select("full_name, role")
      .eq("id", id)
      .maybeSingle<{ full_name: string; role: string }>();
    if (!target || target.role === "main_therapist") return fail();

    // reassign any lingering patients, then remove the auth user (profile cascades)
    await admin.from("patients").update({ therapist_id: me.id }).eq("therapist_id", id);
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw error;

    await logActivity(admin, {
      actorId: me.id,
      actorName: me.full_name,
      actionKey: "aDelDoc",
      kind: "doctor",
      meta: { arg: target.full_name },
    });

    revalidate();
    return ok(null);
  } catch (err) {
    console.error("[deleteDoctorForever]", err);
    return fail();
  }
}

/** Self-service: a therapist edits their own profile (name, title, phone, age, bio). */
export async function updateMyProfile(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const me = await getCurrentProfile();
    if (!me) return fail();
    const admin = createAdminClient();

    const name = String(formData.get("name") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();
    const ageRaw = String(formData.get("age") ?? "").trim();
    const age = ageRaw ? Number(ageRaw) : null;

    const { error } = await admin
      .from("profiles")
      .update({
        full_name: name || me.full_name,
        title: title || null,
        phone: phone || null,
        bio: bio || null,
        age: age && !Number.isNaN(age) ? age : null,
      })
      .eq("id", me.id);
    if (error) throw error;

    revalidatePath("/profile");
    return ok(null);
  } catch (err) {
    console.error("[updateMyProfile]", err);
    return fail();
  }
}
