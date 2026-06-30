"use server";

import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { can } from "@/lib/permissions";
import { logActivity } from "@/lib/activity";
import { IdRefSchema } from "@/lib/zod-schemas";
import { ok, fail, type ActionResult } from "@/lib/types";

const BUCKET = "patient-files";
const MAX_BYTES = 50 * 1024 * 1024;

/** Upload a file to Storage (patient-files/<patientId>/<uuid>-<name>) + record it. */
export async function uploadFile(formData: FormData): Promise<ActionResult> {
  try {
    const me = await getCurrentProfile();
    if (!me || !can(me.role, me.permissions, "manage_files")) return fail();

    const patientId = String(formData.get("patientId") ?? "");
    const file = formData.get("file");
    if (!patientId || !(file instanceof File) || file.size === 0)
      return fail("errNoFile");
    if (file.size > MAX_BYTES) return fail("errFileBig");

    const supabase = await createClient();
    const path = `${patientId}/${crypto.randomUUID()}-${file.name}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type || "application/octet-stream" });
    if (upErr) throw upErr;

    const { error: insErr } = await supabase.from("files").insert({
      patient_id: patientId,
      name: file.name,
      size: file.size,
      storage_path: path,
      uploaded_by: me.id,
    });
    if (insErr) {
      await supabase.storage.from(BUCKET).remove([path]); // rollback
      throw insErr;
    }

    await logActivity(supabase, {
      actorId: me.id,
      actorName: me.full_name,
      actionKey: "aUpload",
      kind: "file",
      patientId,
    });
    revalidatePath(`/patients/${patientId}`);
    revalidatePath("/reports");
    revalidatePath("/dashboard");
    return ok(null);
  } catch (err) {
    console.error("[uploadFile]", err);
    return fail();
  }
}

export async function deleteFile(input: unknown): Promise<ActionResult> {
  try {
    const me = await getCurrentProfile();
    if (!me || !can(me.role, me.permissions, "manage_files")) return fail();
    const d = IdRefSchema.parse(input);
    const supabase = await createClient();

    const { data: row } = await supabase
      .from("files")
      .select("storage_path")
      .eq("id", d.id)
      .maybeSingle<{ storage_path: string }>();

    const { error } = await supabase.from("files").delete().eq("id", d.id);
    if (error) throw error;
    if (row?.storage_path)
      await supabase.storage.from(BUCKET).remove([row.storage_path]);

    await logActivity(supabase, {
      actorId: me.id,
      actorName: me.full_name,
      actionKey: "aDelFile",
      kind: "file",
      patientId: d.patientId,
    });
    revalidatePath(`/patients/${d.patientId}`);
    revalidatePath("/reports");
    return ok(null);
  } catch (err) {
    console.error("[deleteFile]", err);
    return fail();
  }
}

/** Short-lived signed URL for download (RLS-checked under the user's session). */
export async function getFileUrl(
  storagePath: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60);
    if (error || !data) throw error ?? new Error("no url");
    return ok({ url: data.signedUrl });
  } catch (err) {
    console.error("[getFileUrl]", err);
    return fail();
  }
}
