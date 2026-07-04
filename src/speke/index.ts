/**
 * AWS SPEKE v2 support: a cross-field validator for the SPEKE CPIX profile and
 * a framework-agnostic request handler that turns a SPEKE request document
 * into a response with content keys and per-DRM-system PSSH filled in.
 *
 * SPEKE v2 flow: an encryptor POSTs a CPIX "request" (ContentKey kids without
 * key material, DRMSystem entries with only systemId/kid, usage rules with
 * intendedTrackType). The key server returns the same document with keys and
 * DRM signaling populated.
 */
import { CPIX } from "../model/cpix.js";
import { ContentKey, ContentKeyList } from "../model/content-key.js";
import { DRMSystem, DRMSystemList } from "../model/drm-system.js";
import { AudioFilter, VideoFilter, KeyPeriodFilter } from "../model/filters.js";
import { UsageRule, UsageRuleList } from "../model/usage-rule.js";
import { Period, PeriodList } from "../model/period.js";
import { WIDEVINE_SYSTEM_ID, PLAYREADY_SYSTEM_ID } from "../constants.js";
import { b64encode, b64decode, b16encode } from "../base64.js";
import * as widevine from "../drm/widevine.js";
import * as playready from "../drm/playready.js";

/** Common Encryption scheme values (CPIX 2.3+). */
export type CommonEncryptionScheme = "cenc" | "cbcs" | "cens" | "cbc1";

export interface SpekeRequestOptions {
  /**
   * SPEKE protocol version. v1 → CPIX-2.0-shaped (single key, no `version`
   * attribute, no `commonEncryptionScheme`); v2 → CPIX 2.3 (multi-key,
   * `commonEncryptionScheme`). Key rotation is supported by BOTH versions.
   * Note: SPEKE also signals the version via the `X-Speke-Version` HTTP header
   * — set it on the request (see {@link SPEKE_VERSION_HEADER}).
   */
  version: "1.0" | "2.0";
  /** Content identifier (v2 typically sets it; v1 often omits it). */
  contentId?: string;
  /** Key ids to request (one for single-key VOD). */
  keyIds: string[];
  /** DRM systems to request, by systemId. */
  drmSystems: { systemId: string }[];
  /**
   * Key rotation periods (supported by v1 and v2). Emits a ContentKeyPeriodList
   * plus KeyPeriodFilters. SPEKE tracks periods by `index`; `start`/`end` are
   * accepted for servers that use them but AWS SPEKE ignores them.
   */
  rotation?: { periods: Array<{ index?: number; start?: string; end?: string }> };
  /** commonEncryptionScheme for the content keys (CPIX 2.3+ / SPEKE v2). */
  commonEncryptionScheme?: CommonEncryptionScheme;
}

/** The HTTP header SPEKE uses to signal its version (e.g. "1.0", "2.0"). */
export const SPEKE_VERSION_HEADER = "X-Speke-Version";

/**
 * Build a SPEKE request CPIX document. Vendor-neutral and version-aware:
 *
 * - `version: "1.0"` → CPIX-2.0-shaped: single-key style, no `version`
 *   attribute, no `commonEncryptionScheme`.
 * - `version: "2.0"` → CPIX 2.3: `version` attribute and `commonEncryptionScheme`.
 *
 * Key rotation is supported by BOTH versions: passing `rotation` emits a
 * `ContentKeyPeriodList` (index-based, per SPEKE) plus the `KeyPeriodFilter`
 * elements SPEKE requires to bind keys to periods. Remember to also send the
 * `X-Speke-Version` header on the HTTP request ({@link SPEKE_VERSION_HEADER}).
 */
export function buildSpekeRequest(options: SpekeRequestOptions): CPIX {
  const isV2 = options.version === "2.0";

  const contentKeys = new ContentKeyList(
    ...options.keyIds.map(
      (kid) =>
        new ContentKey({ kid, commonEncryptionScheme: isV2 ? (options.commonEncryptionScheme ?? null) : null }),
    ),
  );

  const drmSystems = new DRMSystemList();
  for (const kid of options.keyIds) {
    for (const system of options.drmSystems) {
      drmSystems.append(new DRMSystem({ kid, systemId: system.systemId }));
    }
  }

  // The version attribute drives serialization; for v1 the serializer gates the
  // attribute and commonEncryptionScheme back out (both are 2.3+ features).
  const cpix = new CPIX({
    contentId: options.contentId ?? null,
    version: isV2 ? "2.3" : "2.2",
    contentKeys,
    drmSystems,
  });

  if (options.rotation) {
    const periods = options.rotation.periods.map(
      (p, i) => new Period({ id: `period${i}`, index: p.index ?? null, start: p.start ?? null, end: p.end ?? null }),
    );
    cpix.periods = new PeriodList(...periods);
    // SPEKE requires a KeyPeriodFilter per rotated key to bind it to the periods.
    cpix.usageRules = new UsageRuleList(
      ...options.keyIds.map((kid) => new UsageRule({ kid, filters: periods.map((p) => new KeyPeriodFilter(p.id)) })),
    );
  }

  return cpix;
}

/** Caller policy for {@link validateSpekeRequest} (profile-specific, not spec). */
export interface SpekeRequestPolicy {
  /**
   * Reject a document that carries a rotation block. Some key servers reject a
   * `ContentKeyPeriodList` on single-key VOD — that is a caller/profile concern,
   * so it is asserted here rather than baked into the builder.
   */
  allowRotation?: boolean;
}

/**
 * Validate the request side of a SPEKE exchange: at least one content key,
 * period filters that reference existing periods, and — when a rotation block
 * is present — the `KeyPeriodFilter` SPEKE requires. Mirror of
 * {@link validateSpekeV2} for outgoing requests.
 *
 * Whether a rotation block is *allowed* is caller policy (`policy.allowRotation`),
 * never tied to the SPEKE version — a period block is standard CPIX key
 * rotation, valid in both v1 and v2.
 *
 * @returns `[valid, errors]`.
 */
export function validateSpekeRequest(cpix: CPIX, policy: SpekeRequestPolicy = {}): [boolean, string[]] {
  const errors: string[] = [];
  if (cpix.contentKeys.length === 0) errors.push("request must list at least one content key");

  // KeyPeriodFilter -> ContentKeyPeriod reference integrity.
  errors.push(...cpix.checkPeriodFilters()[1]);

  if (cpix.periods.length > 0) {
    if (policy.allowRotation === false) {
      errors.push("rotation block (ContentKeyPeriodList) is not allowed by this profile");
    }
    const hasFilter = cpix.usageRules.some((rule) => [...rule].some((f) => f instanceof KeyPeriodFilter));
    if (!hasFilter) {
      errors.push("key rotation (ContentKeyPeriodList) requires a ContentKeyUsageRule with a KeyPeriodFilter");
    }
  }
  return [errors.length === 0, errors];
}

function isEmptyAudioFilter(f: AudioFilter): boolean {
  return !f.minChannels && !f.maxChannels;
}

function isEmptyVideoFilter(f: VideoFilter): boolean {
  return (
    f.minPixels == null &&
    f.maxPixels == null &&
    f.hdr == null &&
    f.wcg == null &&
    f.minFps == null &&
    f.maxFps == null
  );
}

/**
 * Validate a CPIX document against the AWS SPEKE v2 encryption-contract rules,
 * on top of the base reference-integrity checks in {@link CPIX.validateContent}.
 *
 * Checks: uniform `commonEncryptionScheme`; every `ContentKeyUsageRule` has a
 * unique, non-empty `intendedTrackType`; each rule carries at least one
 * Audio/Video filter (and `ALL` carries exactly one empty AudioFilter + one
 * empty VideoFilter); and HLS media/multivariant signaling is paired per DRM
 * system.
 *
 * @returns `[valid, errors]`.
 */
export function validateSpekeV2(cpix: CPIX): [boolean, string[]] {
  const errors: string[] = [...cpix.validateContent()[1]];

  const schemes = new Set(cpix.contentKeys.map((k) => k.commonEncryptionScheme));
  if (schemes.size > 1) {
    errors.push(`commonEncryptionScheme must be uniform across all content keys; found: ${[...schemes].join(", ")}`);
  }

  const seenTrackTypes = new Set<string>();
  for (const rule of cpix.usageRules) {
    const kid = rule.kid.toString();
    const itt = rule.intendedTrackType;
    if (itt == null || itt === "") {
      errors.push(`usage rule ${kid} is missing intendedTrackType (required by SPEKE v2)`);
      continue;
    }
    const trackType = String(itt);
    if (seenTrackTypes.has(trackType)) {
      errors.push(`duplicate intendedTrackType across usage rules: ${trackType}`);
    }
    seenTrackTypes.add(trackType);

    const audio = (rule as UsageRule).filter((f) => f instanceof AudioFilter) as AudioFilter[];
    const video = (rule as UsageRule).filter((f) => f instanceof VideoFilter) as VideoFilter[];

    if (trackType === "ALL") {
      const ok = audio.length === 1 && isEmptyAudioFilter(audio[0]) && video.length === 1 && isEmptyVideoFilter(video[0]);
      if (!ok) {
        errors.push(`intendedTrackType "ALL" (kid ${kid}) requires exactly one empty AudioFilter and one empty VideoFilter`);
      }
    } else if (audio.length === 0 && video.length === 0) {
      errors.push(`usage rule ${kid} (${trackType}) must contain at least one AudioFilter or VideoFilter`);
    }
  }

  for (const drm of cpix.drmSystems) {
    const hasMedia = drm.hlsSignalingData != null;
    const hasMaster = drm.hlsSignalingDataMaster != null;
    if (hasMedia !== hasMaster) {
      errors.push(
        `DRMSystem ${drm.kid}/${drm.systemId} has only one of HLS media/multivariant signaling data; SPEKE v2 expects both`,
      );
    }
  }

  return [errors.length === 0, errors];
}

/** A content key returned by a {@link SpekeKeyProvider}. */
export interface SpekeKey {
  /** Base64-encoded content encryption key. */
  cek: string;
  /** Optional base64-encoded explicit IV. */
  explicitIv?: string;
}

/** Supplies content keys for the kids in a SPEKE request. */
export interface SpekeKeyProvider {
  getKey(kid: string, contentId: string | null): Promise<SpekeKey> | SpekeKey;
}

/**
 * A key provider that mints random 16-byte keys. Suitable for testing and
 * reference deployments; a real server should back this with a key store.
 */
export const randomKeyProvider: SpekeKeyProvider = {
  getKey(): SpekeKey {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return { cek: b64encode(bytes) };
  },
};

/** Context passed to a {@link DrmSignalingProvider} for one `DRMSystem`. */
export interface DrmSignalingContext {
  /** The DRMSystem element to populate (mutate in place). */
  drm: DRMSystem;
  /** The key id, as a canonical lowercase UUID string. */
  kid: string;
  /** The document `contentId`, if any. */
  contentId: string | null;
  /** The base64 content key for this kid, if one is available. */
  cek: string | undefined;
  /** The options `handleSpeke` was called with. */
  options: HandleSpekeOptions;
}

/**
 * Populates a single `DRMSystem` (typically its PSSH, ContentProtectionData or
 * HLSSignalingData). Registered per systemId; may be async.
 */
export type DrmSignalingProvider = (ctx: DrmSignalingContext) => void | Promise<void>;

/** Built-in Widevine PSSH provider. */
export function widevineSignalingProvider(): DrmSignalingProvider {
  return ({ drm, kid, contentId, options }) => {
    if (drm.pssh != null) return;
    drm.pssh = b64encode(
      widevine.generatePssh({ keyIds: [kid], provider: options.widevineProvider, contentId: contentId ?? undefined }),
    );
  };
}

/** Built-in PlayReady PSSH provider (WRMHEADER + PlayReady object). */
export function playreadySignalingProvider(): DrmSignalingProvider {
  return async ({ drm, kid, cek, options }) => {
    if (drm.pssh != null) return;
    const keyHex = cek != null ? b16encode(b64decode(cek)) : undefined;
    drm.pssh = b64encode(
      await playready.generatePssh(
        [{ key_id: kid, key: keyHex }],
        options.playreadyLaUrl ?? "",
        "AESCTR",
        keyHex != null, // checksum requires the key
      ),
    );
  };
}

/** The DRM signaling providers enabled by default (Widevine + PlayReady). */
export function defaultDrmProviders(): Record<string, DrmSignalingProvider> {
  return {
    [WIDEVINE_SYSTEM_ID.toString()]: widevineSignalingProvider(),
    [PLAYREADY_SYSTEM_ID.toString()]: playreadySignalingProvider(),
  };
}

export interface HandleSpekeOptions {
  /** Source of content keys (defaults to {@link randomKeyProvider}). */
  keyProvider?: SpekeKeyProvider;
  /** Widevine provider name embedded in the PSSH data. */
  widevineProvider?: string;
  /** PlayReady license-acquisition URL for the WRMHEADER. */
  playreadyLaUrl?: string;
  /**
   * DRM signaling providers keyed by systemId (case-insensitive). Merged over
   * {@link defaultDrmProviders}, so you can override Widevine/PlayReady or add
   * ClearKey, FairPlay, etc. A DRMSystem whose systemId has no provider is
   * left untouched.
   */
  drmProviders?: Record<string, DrmSignalingProvider>;
}

/**
 * Turn a SPEKE v2 request document into a response: mint any missing content
 * keys and run the registered DRM signaling provider for each DRM system.
 * Returns the response CPIX as a string.
 */
export async function handleSpeke(requestXml: string, options: HandleSpekeOptions = {}): Promise<string> {
  const keyProvider = options.keyProvider ?? randomKeyProvider;
  const cpix = CPIX.parse(requestXml);
  const contentId = cpix.contentId;

  // Merge caller providers over the defaults, keyed by lowercase systemId.
  const providers: Record<string, DrmSignalingProvider> = {};
  for (const [id, provider] of Object.entries(defaultDrmProviders())) providers[id.toLowerCase()] = provider;
  for (const [id, provider] of Object.entries(options.drmProviders ?? {})) providers[id.toLowerCase()] = provider;

  // 1. Fill in content keys.
  const cekByKid = new Map<string, string>();
  for (const contentKey of cpix.contentKeys) {
    let cek = contentKey.cek;
    if (cek == null) {
      const key = await keyProvider.getKey(contentKey.kid.toString(), contentId);
      cek = key.cek;
      contentKey.cek = cek;
      if (key.explicitIv != null) contentKey.explicitIv = key.explicitIv;
    }
    cekByKid.set(contentKey.kid.toString(), cek);
  }

  // 2. Run the DRM signaling provider for each system.
  for (const drm of cpix.drmSystems) {
    const provider = providers[drm.systemId.toString().toLowerCase()];
    if (!provider) continue;
    const kid = drm.kid.toString();
    await provider({ drm, kid, contentId, cek: cekByKid.get(kid), options });
  }

  return cpix.toString();
}
