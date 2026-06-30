"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";
import { Brand } from "@/components/layout/Brand";
import { LangSwitcher } from "@/components/layout/LangSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useI18n } from "@/providers/hooks";
import {
  requestLoginCode,
  verifyLoginCode,
  type LoginState,
} from "@/app/actions/auth";

const initial: LoginState = { step: "credentials" };

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [role, setRole] = useState<"therapist" | "parent">("therapist");
  const [showPw, setShowPw] = useState(false);

  const [credState, credAction, credPending] = useActionState(
    requestLoginCode,
    initial,
  );
  const [codeState, codeAction, codePending] = useActionState(
    verifyLoginCode,
    initial,
  );

  const onCodeStep = credState.step === "code";

  useEffect(() => {
    if (codeState.done) {
      router.replace("/");
      router.refresh();
    }
  }, [codeState.done, router]);

  return (
    <div className="login-wrap">
      <aside className="login-aside">
        <span className="bubble b1" />
        <span className="bubble b2" />
        <span className="bubble b3" />
        <div className="aside-content">
          <Brand subKey="subLogin" />
          <h1>{t("heroTitle")}</h1>
          <p>{t("heroDesc")}</p>
        </div>
        <svg className="brain-art" viewBox="0 0 200 200" fill="#c9bdf0" opacity=".6">
          <path d="M100 30c30 0 50 20 55 45 8 5 12 14 8 24-3 8-10 12-18 12-6 14-22 22-45 22s-39-8-45-22c-8 0-15-4-18-12-4-10 0-19 8-24 5-25 25-45 55-45z" />
        </svg>
      </aside>

      <div className="login-panel">
        <div className="login-topbar">
          <ThemeToggle variant="icon" />
          <LangSwitcher />
        </div>

        <div className="login-card">
          <div style={{ marginBottom: 30 }}>
            <Brand subKey="subLogin" />
          </div>
          <h2>{t("welcomeBack")}</h2>
          <p className="sub">{t("loginSub")}</p>

          {!onCodeStep ? (
            <>
              <div className="seg">
                <button
                  type="button"
                  className={role === "therapist" ? "on" : ""}
                  onClick={() => setRole("therapist")}
                >
                  <Icon name="stetho" /> {t("roleTher")}
                </button>
                <button
                  type="button"
                  className={role === "parent" ? "on" : ""}
                  onClick={() => setRole("parent")}
                >
                  <Icon name="users" /> {t("roleParent")}
                </button>
              </div>

              <form action={credAction}>
                <input type="hidden" name="role" value={role} />
                {credState.error && (
                  <div className="form-error">{t(credState.error)}</div>
                )}
                <div className="field">
                  <label>{t("username")}</label>
                  <div className="control">
                    <Icon name="user" />
                    <input
                      name="username"
                      autoComplete="username"
                      placeholder={t("phUsername")}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>{t("password")}</label>
                  <div className="control">
                    <Icon name="lock" />
                    <input
                      name="password"
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="toggle-eye"
                      onClick={() => setShowPw((s) => !s)}
                    >
                      <Icon name={showPw ? "eyeOff" : "eye"} />
                    </button>
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-block"
                  type="submit"
                  style={{ marginTop: 6 }}
                  disabled={credPending}
                >
                  {credPending ? "..." : t("btnLogin")}
                </button>
              </form>
            </>
          ) : (
            <form action={codeAction}>
              <input
                type="hidden"
                name="challengeId"
                value={credState.challengeId ?? ""}
              />
              {codeState.error && (
                <div className="form-error">{t(codeState.error)}</div>
              )}
              <div className="field">
                <label>{t("password")}</label>
                <div className="control">
                  <Icon name="lock" />
                  <input
                    name="code"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    placeholder="••••••"
                  />
                </div>
              </div>
              {credState.devCode && (
                <div className="login-hint">
                  DEV — code: <b>{credState.devCode}</b>
                </div>
              )}
              <button
                className="btn btn-primary btn-block"
                type="submit"
                style={{ marginTop: 6 }}
                disabled={codePending}
              >
                {codePending ? "..." : t("btnLogin")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
