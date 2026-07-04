/**
 * CPIX version metadata — kept separate from the (large) embedded schema
 * strings so the core model can depend on it without pulling in `schemas.ts`.
 */

/** CPIX versions with a bundled schema. */
export type CpixVersion = "2.2" | "2.3" | "2.3.1" | "2.4";

export const SUPPORTED_CPIX_VERSIONS: CpixVersion[] = ["2.2", "2.3", "2.3.1", "2.4"];

/**
 * Newest bundled CPIX version. Used as the fallback for serialization and
 * validation only when a document declares no `version` (and none is passed
 * explicitly) — there is deliberately no arbitrary "default" version; the
 * document's own version drives the shape.
 */
export const LATEST_CPIX_VERSION: CpixVersion = "2.4";

const VERSION_RANK: Record<CpixVersion, number> = { "2.2": 220, "2.3": 230, "2.3.1": 231, "2.4": 240 };

/** True if CPIX version `v` is at least `min` (e.g. `atLeastVersion(v, "2.3")`). */
export function atLeastVersion(v: CpixVersion, min: CpixVersion): boolean {
  return VERSION_RANK[v] >= VERSION_RANK[min];
}

/** Narrow an arbitrary version string to a supported {@link CpixVersion}. */
export function coerceCpixVersion(v: string | null | undefined): CpixVersion | undefined {
  return SUPPORTED_CPIX_VERSIONS.includes(v as CpixVersion) ? (v as CpixVersion) : undefined;
}
