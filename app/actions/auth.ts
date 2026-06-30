"use server";

import { createHash } from "node:crypto";

import { createClient as createUserClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LoginRequestSchema, VerifyCodeSchema } from "@/lib/zod-schemas";
import { GENERIC_ERROR } from "@/lib/types";

// ---------------------------------------------------------------------------
// Login is two steps (see docs/REWRITE_PLAN.md §4):
//   1) username + password  -> verify password, email a 6-digit code
//   2) code                 -> create the real session
// The email is never shown to the user; it only receives the code.
// ---------------------------------------------------------------------------

export type LoginState = {
  step: "credentials" | "code";
  challengeId?: string;
  error?: string;
  /** Set true once the session is established (step 2 succeeded). */
  done?: boolean;
  /** DEV ONLY: surfaced when no email provider is configured, so you can test. */
  devCode?: string;
};

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function sixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Trilingual (he / ar / en) branded HTML for the login-code email. */
function loginCodeEmail(code: string): { subject: string; html: string; text: string } {
  const subject = "رمز الدخول · קוד כניסה · Login code — Little Talkers";
  const text =
    `קוד הכניסה שלך: ${code} (תקף ${CODE_TTL_MINUTES} דקות)\n` +
    `رمز الدخول الخاص بك: ${code} (صالح ${CODE_TTL_MINUTES} دقائق)\n` +
    `Your login code: ${code} (valid for ${CODE_TTL_MINUTES} minutes)`;
  const html = `<!doctype html>
<html dir="rtl" lang="he">
<body style="margin:0;background:#f4f3fb;font-family:'Tajawal',Arial,sans-serif;color:#2b2b3a;">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px;">
    <div style="background:#fff;border-radius:20px;padding:32px;box-shadow:0 8px 30px rgba(120,110,200,.12);text-align:center;">
      <div style="font-size:20px;font-weight:700;color:#7c6ee0;margin-bottom:4px;">מדברים קטנים · متحدثون صغار · Little Talkers</div>
      <p style="margin:18px 0 6px;font-size:15px;color:#555;">קוד הכניסה שלך · رمز الدخول الخاص بك · Your login code</p>
      <div style="font-size:38px;font-weight:800;letter-spacing:8px;color:#5a4fcf;margin:14px 0;direction:ltr;">${code}</div>
      <p style="margin:8px 0 0;font-size:13px;color:#888;">
        תקף ${CODE_TTL_MINUTES} דקות · صالح ${CODE_TTL_MINUTES} دقائق · valid for ${CODE_TTL_MINUTES} minutes
      </p>
      <p style="margin:20px 0 0;font-size:12px;color:#aaa;">
        אם לא ביקשת קוד זה, התעלם מהודעה זו · إذا لم تطلب هذا الرمز فتجاهل هذه الرسالة · If you didn't request this, ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`;
  return { subject, html, text };
}

async function sendLoginCodeEmail(email: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  // No provider configured -> log to the server console so login is testable in dev.
  if (!apiKey) {
    console.info(`[login-code] code for ${email}: ${code}`);
    return;
  }
  const { subject, html, text } = loginCodeEmail(code);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.LOGIN_CODE_FROM_EMAIL ?? "no-reply@example.com",
      to: email,
      subject,
      html,
      text,
    }),
  });
  // Fail loudly: if Resend rejects (bad key, unverified domain), don't pretend
  // the code was sent — let requestLoginCode surface a generic error instead of
  // silently locking the user out with no code and no dev fallback.
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend send failed (${res.status}): ${detail}`);
  }
}

/** Step 1: verify username + password, then issue an email code. */
export async function requestLoginCode(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    const parsed = LoginRequestSchema.safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
      role: formData.get("role") ?? undefined,
    });
    if (!parsed.success) {
      return { step: "credentials", error: "errLogin" };
    }
    const { username, password, role: selectedRole } = parsed.data;
    const admin = createAdminClient();

    // username -> user id -> email (all server-side; email never leaves the server)
    const { data: profile } = await admin
      .from("profiles")
      .select("id, is_active, role")
      .ilike("username", username)
      .maybeSingle();

    const invalid: LoginState = {
      step: "credentials",
      error: "errCreds",
    };
    if (!profile || profile.is_active === false) return invalid;

    const { data: userRes } = await admin.auth.admin.getUserById(profile.id);
    const email = userRes.user?.email;
    if (!email) return invalid;

    // Verify the password without creating a persisted session.
    const { createClient: createPlainClient } = await import(
      "@supabase/supabase-js"
    );
    const probe = createPlainClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error: pwError } = await probe.auth.signInWithPassword({
      email,
      password,
    });
    if (pwError) return invalid;

    // Enforce the selected login tab: a parent can't sign in via the therapist
    // tab and vice-versa. Checked AFTER the password so it can't be used to
    // probe which usernames are therapists vs parents.
    if (selectedRole) {
      const isTherapistAcct =
        profile.role === "main_therapist" || profile.role === "therapist";
      if (selectedRole === "parent" && profile.role !== "parent") {
        return { step: "credentials", error: "errTherapistTab" };
      }
      if (selectedRole === "therapist" && !isTherapistAcct) {
        return { step: "credentials", error: "errParentTab" };
      }
    }

    // Issue + store a hashed code, then email it.
    const code = sixDigitCode();
    const expiresAt = new Date(
      Date.now() + CODE_TTL_MINUTES * 60 * 1000,
    ).toISOString();

    const { data: row, error: insErr } = await admin
      .from("login_codes")
      .insert({
        user_id: profile.id,
        code_hash: hashCode(code),
        expires_at: expiresAt,
      })
      .select("id")
      .single();
    if (insErr || !row) throw insErr ?? new Error("could not create login code");

    await sendLoginCodeEmail(email, code);

    return {
      step: "code",
      challengeId: row.id,
      devCode: process.env.RESEND_API_KEY ? undefined : code,
    };
  } catch (err) {
    console.error("[requestLoginCode]", err);
    return { step: "credentials", error: GENERIC_ERROR };
  }
}

/** Step 2: verify the emailed code, then establish the real session. */
export async function verifyLoginCode(
  prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const challengeId = String(formData.get("challengeId") ?? "");
  const back: LoginState = { ...prev, step: "code", challengeId };
  try {
    const parsed = VerifyCodeSchema.safeParse({
      challengeId,
      code: formData.get("code"),
    });
    if (!parsed.success) {
      return { ...back, error: "errCode6" };
    }
    const admin = createAdminClient();

    const { data: lc } = await admin
      .from("login_codes")
      .select("id, user_id, code_hash, expires_at, consumed_at, attempts")
      .eq("id", parsed.data.challengeId)
      .maybeSingle();

    if (
      !lc ||
      lc.consumed_at ||
      lc.attempts >= MAX_ATTEMPTS ||
      new Date(lc.expires_at).getTime() < Date.now()
    ) {
      return { ...back, error: "errCodeExpired" };
    }

    if (lc.code_hash !== hashCode(parsed.data.code)) {
      await admin
        .from("login_codes")
        .update({ attempts: lc.attempts + 1 })
        .eq("id", lc.id);
      return { ...back, error: "errCodeWrong" };
    }

    await admin
      .from("login_codes")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", lc.id);

    // Establish the session: mint a one-time OTP, then verify it on the
    // user-scoped client so the auth cookies are written.
    const { data: userRes } = await admin.auth.admin.getUserById(lc.user_id);
    const email = userRes.user?.email;
    if (!email) throw new Error("user has no email");

    const { data: link, error: linkErr } =
      await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (linkErr || !link.properties?.email_otp) {
      throw linkErr ?? new Error("could not mint otp");
    }

    const supabase = await createUserClient();
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      email,
      token: link.properties.email_otp,
      type: "email",
    });
    if (verifyErr) throw verifyErr;

    return { step: "code", challengeId, done: true }; // page redirects on this.
  } catch (err) {
    console.error("[verifyLoginCode]", err);
    return { ...back, error: GENERIC_ERROR };
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createUserClient();
  await supabase.auth.signOut();
}
