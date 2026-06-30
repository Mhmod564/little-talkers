import { S, type DictKey } from "./dictionary";

export { LANGS, localeFor, dirFor, LANG_KEY, DISPLAY_ORDER } from "./langs";
export type { LangCode } from "./langs";
export type { DictKey } from "./dictionary";

/** translate key `k` for language index `L` (0=he, 1=ar, 2=en). */
export function translate(L: number, k: DictKey | string): string {
  const e = (S as Record<string, readonly string[]>)[k as string];
  return e ? (e[L] ?? e[0] ?? String(k)) : String(k);
}

/** translate + interpolate the single {0} placeholder. */
export function translateWith(
  L: number,
  k: DictKey | string,
  v: string | number,
): string {
  return translate(L, k).replace("{0}", String(v));
}
