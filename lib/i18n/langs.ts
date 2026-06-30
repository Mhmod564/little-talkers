// Language configuration ported from the prototype LANGS.

export const LANGS = [
  { code: "he", native: "עברית", short: "עב" },
  { code: "ar", native: "العربية", short: "ع" },
  { code: "en", native: "English", short: "EN" },
] as const;

export type LangCode = (typeof LANGS)[number]["code"];

export const LANG_KEY = "littletalkers.lang";

/** Display order in the switcher menu: Arabic, Hebrew, English (matches prototype). */
export const DISPLAY_ORDER = [1, 0, 2] as const;

export const dirFor = (code: LangCode): "rtl" | "ltr" =>
  code === "en" ? "ltr" : "rtl";

export const localeFor = (index: number): string =>
  ["he-IL", "ar-EG", "en-US"][index] ?? "he-IL";
