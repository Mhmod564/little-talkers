// Pure formatting helpers ported from the prototype utilities.
// Functions that localize take an explicit `locale` (e.g. "he-IL" from useI18n).

export function hashStr(s: string): number {
  let h = 0;
  const str = String(s);
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return h;
}

/** colored-avatar class bucket (0..4). */
export const avaClass = (id: string): string =>
  "ava-c" + (Math.abs(hashStr(id)) % 5);

/** two-letter initials, stripping doctor prefixes (ד״ר / د. / Dr.). */
export function initials(name: string): string {
  const p = String(name ?? "")
    .replace(/^(ד[״"'.]?ר[׳'.]?|د\.?|dr\.?)\s+/i, "")
    .trim()
    .split(/\s+/);
  return ((p[0] || "")[0] || "") + ((p[1] || "")[0] || "");
}

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export function fmtDate(d: string | null | undefined, locale: string): string {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(d));
  } catch {
    return d;
  }
}

export function fmtDateTime(ts: string | null | undefined, locale: string): string {
  if (!ts) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return ts;
  }
}

export function fmtTime(ts: string | null | undefined, locale: string): string {
  if (!ts) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return "";
  }
}

export function monthShort(d: string | null | undefined, locale: string): string {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(d));
  } catch {
    return "";
  }
}

export function fmtSize(b: number | null | undefined): string {
  if (b == null) return "";
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

/** canonical gender → translated label. Accepts new ('male'/'female') and legacy Hebrew values. */
export function genderText(
  v: string | null | undefined,
  t: (k: string) => string,
): string {
  if (v === "male" || v === "זכר") return t("gMale");
  if (v === "female" || v === "נקבה") return t("gFemale");
  return v || "—";
}
