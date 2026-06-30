"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  LANGS,
  LANG_KEY,
  dirFor,
  localeFor,
  translate,
  translateWith,
  type DictKey,
  type LangCode,
} from "@/lib/i18n";

type I18nValue = {
  L: number;
  code: LangCode;
  dir: "rtl" | "ltr";
  locale: string;
  t: (k: DictKey | string) => string;
  ti: (k: DictKey | string, v: string | number) => string;
  setLang: (i: number) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [L, setL] = useState(0); // default Hebrew (matches server-rendered <html lang="he">)

  // Pick up the persisted language after hydration.
  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(LANG_KEY) ?? "", 10);
      if (!Number.isNaN(saved) && saved >= 0 && saved < LANGS.length) setL(saved);
    } catch {
      /* ignore */
    }
  }, []);

  // Keep <html lang/dir> in sync with the active language.
  useEffect(() => {
    const code = LANGS[L]!.code;
    document.documentElement.lang = code;
    document.documentElement.dir = dirFor(code);
  }, [L]);

  const setLang = (i: number) => {
    setL(i);
    try {
      localStorage.setItem(LANG_KEY, String(i));
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<I18nValue>(
    () => ({
      L,
      code: LANGS[L]!.code,
      dir: dirFor(LANGS[L]!.code),
      locale: localeFor(L),
      t: (k) => translate(L, k),
      ti: (k, v) => translateWith(L, k, v),
      setLang,
    }),
    [L],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}
