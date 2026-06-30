"use server";

import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { can } from "@/lib/permissions";
import { logActivity } from "@/lib/activity";
import {
  NoteSchema,
  ProgressSchema,
  PlanSchema,
  SessionSchema,
  SessionUpdateSchema,
  SummarySchema,
  RecordingSchema,
  IdRefSchema,
} from "@/lib/zod-schemas";
import { ok, fail, type ActionResult } from "@/lib/types";
import type { Permission } from "@/lib/types";

async function ctx(perm: Permission) {
  const me = await getCurrentProfile();
  if (!me || !can(me.role, me.permissions, perm)) return null;
  const supabase = await createClient();
  return { me, supabase };
}

function touch(patientId: string) {
  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/dashboard");
  revalidatePath("/sessions");
  revalidatePath("/recordings");
  revalidatePath("/reports");
}

// ---- notes ----------------------------------------------------------------

export async function addNote(input: unknown): Promise<ActionResult> {
  try {
    const c = await ctx("manage_notes");
    if (!c) return fail();
    const d = NoteSchema.parse(input);
    const { error } = await c.supabase.from("notes").insert({
      patient_id: d.patientId,
      session_date: d.date,
      body: d.text,
      author_id: c.me.id,
    });
    if (error) throw error;
    // bump last_session if this note is newer
    await c.supabase
      .from("patients")
      .update({ last_session: d.date })
      .eq("id", d.patientId)
      .lt("last_session", d.date);
    await logActivity(c.supabase, {
      actorId: c.me.id,
      actorName: c.me.full_name,
      actionKey: "aAddNote",
      kind: "note",
      patientId: d.patientId,
    });
    touch(d.patientId);
    return ok(null);
  } catch (err) {
    console.error("[addNote]", err);
    return fail();
  }
}

export async function deleteNote(input: unknown): Promise<ActionResult> {
  try {
    const c = await ctx("manage_notes");
    if (!c) return fail();
    const d = IdRefSchema.parse(input);
    const { error } = await c.supabase.from("notes").delete().eq("id", d.id);
    if (error) throw error;
    await logActivity(c.supabase, {
      actorId: c.me.id,
      actorName: c.me.full_name,
      actionKey: "aDelNote",
      kind: "note",
      patientId: d.patientId,
    });
    touch(d.patientId);
    return ok(null);
  } catch (err) {
    console.error("[deleteNote]", err);
    return fail();
  }
}

// ---- progress / plan ------------------------------------------------------

export async function updateProgress(input: unknown): Promise<ActionResult> {
  try {
    const c = await ctx("manage_patients");
    if (!c) return fail();
    const d = ProgressSchema.parse(input);
    const { error } = await c.supabase
      .from("patients")
      .update({ progress: d.progress })
      .eq("id", d.patientId);
    if (error) throw error;
    await logActivity(c.supabase, {
      actorId: c.me.id,
      actorName: c.me.full_name,
      actionKey: "aProgress",
      kind: "progress",
      patientId: d.patientId,
      meta: { arg: d.progress },
    });
    touch(d.patientId);
    return ok(null);
  } catch (err) {
    console.error("[updateProgress]", err);
    return fail();
  }
}

export async function updatePlan(input: unknown): Promise<ActionResult> {
  try {
    const c = await ctx("manage_patients");
    if (!c) return fail();
    const d = PlanSchema.parse(input);
    const { error } = await c.supabase
      .from("patients")
      .update({ plan: d.plan })
      .eq("id", d.patientId);
    if (error) throw error;
    await logActivity(c.supabase, {
      actorId: c.me.id,
      actorName: c.me.full_name,
      actionKey: "aPlan",
      kind: "plan",
      patientId: d.patientId,
    });
    touch(d.patientId);
    return ok(null);
  } catch (err) {
    console.error("[updatePlan]", err);
    return fail();
  }
}

// ---- sessions -------------------------------------------------------------

function combineDateTime(date: string, time?: string): string {
  const t = time && /^\d{1,2}:\d{2}/.test(time) ? time : "23:59";
  return new Date(`${date}T${t}`).toISOString();
}

export async function addSession(input: unknown): Promise<ActionResult> {
  try {
    const c = await ctx("manage_sessions");
    if (!c) return fail();
    const d = SessionSchema.parse(input);
    const { error } = await c.supabase.from("sessions").insert({
      patient_id: d.patientId,
      scheduled_at: combineDateTime(d.date, d.time),
      title: d.title || null,
      status: "scheduled",
    });
    if (error) throw error;
    await logActivity(c.supabase, {
      actorId: c.me.id,
      actorName: c.me.full_name,
      actionKey: "aSchedule",
      kind: "session",
      patientId: d.patientId,
    });
    touch(d.patientId);
    return ok(null);
  } catch (err) {
    console.error("[addSession]", err);
    return fail();
  }
}

export async function updateSession(input: unknown): Promise<ActionResult> {
  try {
    const c = await ctx("manage_sessions");
    if (!c) return fail();
    const d = SessionUpdateSchema.parse(input);
    const { error } = await c.supabase
      .from("sessions")
      .update({
        scheduled_at: combineDateTime(d.date, d.time),
        title: d.title || null,
      })
      .eq("id", d.id);
    if (error) throw error;
    await logActivity(c.supabase, {
      actorId: c.me.id,
      actorName: c.me.full_name,
      actionKey: "aEditSession",
      kind: "session",
      patientId: d.patientId,
    });
    touch(d.patientId);
    return ok(null);
  } catch (err) {
    console.error("[updateSession]", err);
    return fail();
  }
}

export async function deleteSession(input: unknown): Promise<ActionResult> {
  try {
    const c = await ctx("manage_sessions");
    if (!c) return fail();
    const d = IdRefSchema.parse(input);
    const { error } = await c.supabase.from("sessions").delete().eq("id", d.id);
    if (error) throw error;
    await logActivity(c.supabase, {
      actorId: c.me.id,
      actorName: c.me.full_name,
      actionKey: "aDelSession",
      kind: "session",
      patientId: d.patientId,
    });
    touch(d.patientId);
    return ok(null);
  } catch (err) {
    console.error("[deleteSession]", err);
    return fail();
  }
}

export async function writeSummary(input: unknown): Promise<ActionResult> {
  try {
    const c = await ctx("manage_sessions");
    if (!c) return fail();
    const d = SummarySchema.parse(input);
    const { error } = await c.supabase
      .from("sessions")
      .update({ summary: d.summary, status: "completed" })
      .eq("id", d.id);
    if (error) throw error;
    await logActivity(c.supabase, {
      actorId: c.me.id,
      actorName: c.me.full_name,
      actionKey: "aSummary",
      kind: "session",
      patientId: d.patientId,
    });
    touch(d.patientId);
    return ok(null);
  } catch (err) {
    console.error("[writeSummary]", err);
    return fail();
  }
}

// ---- recordings -----------------------------------------------------------

export async function addRecording(input: unknown): Promise<ActionResult> {
  try {
    const c = await ctx("manage_recordings");
    if (!c) return fail();
    const d = RecordingSchema.parse(input);
    const { error } = await c.supabase.from("recordings").insert({
      patient_id: d.patientId,
      title: d.title || null,
      recorded_on: d.date,
      url: d.url,
    });
    if (error) throw error;
    await logActivity(c.supabase, {
      actorId: c.me.id,
      actorName: c.me.full_name,
      actionKey: "aAddRec",
      kind: "recording",
      patientId: d.patientId,
    });
    touch(d.patientId);
    return ok(null);
  } catch (err) {
    console.error("[addRecording]", err);
    return fail();
  }
}

export async function deleteRecording(input: unknown): Promise<ActionResult> {
  try {
    const c = await ctx("manage_recordings");
    if (!c) return fail();
    const d = IdRefSchema.parse(input);
    const { error } = await c.supabase.from("recordings").delete().eq("id", d.id);
    if (error) throw error;
    await logActivity(c.supabase, {
      actorId: c.me.id,
      actorName: c.me.full_name,
      actionKey: "aDelRec",
      kind: "recording",
      patientId: d.patientId,
    });
    touch(d.patientId);
    return ok(null);
  } catch (err) {
    console.error("[deleteRecording]", err);
    return fail();
  }
}
