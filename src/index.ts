/**
 * A TypeScript library for working with CPIX 2.2 (DASH-IF Content Protection
 * Information Exchange) documents.
 *
 * DRM crypto helpers (Widevine/PlayReady signing and key derivation) are async
 * because they use WebCrypto for isomorphism.
 *
 * @packageDocumentation
 */
export { parse } from "./parse.js";
export {
  validate,
  SUPPORTED_CPIX_VERSIONS,
  LATEST_CPIX_VERSION,
  type ValidateOptions,
  type CpixVersion,
} from "./validate.js";

export {
  PSKC,
  XSI,
  DS,
  ENC,
  CPIX_NS,
  NSMAP,
  PLAYREADY_SYSTEM_ID,
  WIDEVINE_SYSTEM_ID,
  VALID_SYSTEM_IDS,
  CONTENT_KEY_WRAPPING_ALGORITHM,
  DOCUMENT_KEY_WRAPPING_ALGORITHM,
  ENCRYPTED_KEY_MAC_ALGORITHM,
} from "./constants.js";

export { Uuid, toUuid } from "./uuid.js";
export { ValueError } from "./errors.js";

export {
  DeliveryData,
  DeliveryDataList,
  DeliveryKey,
  DocumentKey,
  MACMethod,
} from "./model/delivery-data.js";
export { ContentKey, ContentKeyList } from "./model/content-key.js";
export { DRMSystem, DRMSystemList } from "./model/drm-system.js";
export {
  AudioFilter,
  BitrateFilter,
  VideoFilter,
  KeyPeriodFilter,
  LabelFilter,
  parseXsboolean,
  encodeBool,
  type Filter,
} from "./model/filters.js";
export {
  UsageRule,
  UsageRuleList,
  AudioUsageRule,
  VideoUsageRule,
  SDVideoUsageRule,
  HDVideoUsageRule,
  UHD1VideoUsageRule,
  UHD2VideoUsageRule,
} from "./model/usage-rule.js";
export { Period, PeriodList } from "./model/period.js";
export { CPIX } from "./model/cpix.js";

export * as drm from "./drm/index.js";
