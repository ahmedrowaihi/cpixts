/**
 * Widevine DRM helpers: Widevine CENC header (protobuf), PSSH box generation
 * and key-server access.
 *
 * Note: `signRequest` and `getKeys` are async here — WebCrypto (used for the
 * SHA-1 + AES-CBC signature so the port stays isomorphic) is promise-based,
 * unlike Python's synchronous pycryptodome.
 */
import protobuf from "protobufjs";
import { Uuid } from "../uuid.js";
import { b16decode, b64encode, b64decode, toBytes, fromBytes } from "../base64.js";
import { WIDEVINE_SYSTEM_ID } from "../constants.js";
import { buildPsshBox } from "./pssh-box.js";

export { WIDEVINE_SYSTEM_ID };

const PROTO = `
syntax = "proto2";
package proto;
message WidevineCencHeader {
    enum Algorithm { UNENCRYPTED = 0; AESCTR = 1; }
    optional Algorithm algorithm = 1;
    repeated bytes key_id = 2;
    optional string provider = 3;
    optional bytes content_id = 4;
    optional string track_type_deprecated = 5;
    optional string policy = 6;
    optional uint32 crypto_period_index = 7;
    optional bytes grouped_license = 8;
    optional uint32 protection_scheme = 9;
    optional uint32 crypto_period_seconds = 10;
}`;

/** The `WidevineCencHeader` protobuf message type. */
export const WidevineCencHeader = protobuf.parse(PROTO).root.lookupType(
  "proto.WidevineCencHeader",
);

export const VALID_TRACKS = ["AUDIO", "SD", "HD", "UHD1", "UHD2"];

export const PROTECTION_SCHEME: Record<string, number> = {
  cenc: 1667591779,
  cens: 1667591795,
  cbc1: 1667392305,
  cbcs: 1667392371,
};

type KeyIdInput = string | Uuid | Uint8Array;

function keyIdToBytes(keyId: KeyIdInput): Uint8Array {
  if (typeof keyId === "string") return new Uuid(keyId).bytes;
  if (keyId instanceof Uuid) return keyId.bytes;
  // A length-32 byte string is an encoded hex UUID string.
  if (keyId.length === 32) return new Uuid(fromBytes(keyId)).bytes;
  return keyId;
}

async function importAesKey(raw: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", raw as unknown as ArrayBuffer, { name: "AES-CBC" }, false, [
    "encrypt",
  ]);
}

/**
 * Sign a request, returning the base64 signature.
 *
 * SHA-1 over the JSON, then AES-CBC (matching pycryptodome's manual PKCS7 pad
 * to a 16-byte boundary; WebCrypto's own padding block is stripped).
 */
export async function signRequest(
  request: unknown,
  key: string,
  iv: string,
): Promise<string> {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-1", toBytes(JSON.stringify(request)) as unknown as ArrayBuffer),
  );

  // pycryptodome pad(digest, 16): 20 -> 32 bytes, PKCS7.
  const padLen = 16 - (digest.length % 16);
  const padded = new Uint8Array(digest.length + padLen);
  padded.set(digest);
  padded.fill(padLen, digest.length);

  const cryptoKey = await importAesKey(b16decode(key));
  const full = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-CBC", iv: b16decode(iv) as unknown as ArrayBuffer },
      cryptoKey,
      padded as unknown as ArrayBuffer,
    ),
  );
  // WebCrypto appends its own padding block; keep only our manually-padded input.
  return b64encode(full.slice(0, padded.length));
}

export interface GetKeysOptions {
  contentId: string;
  url: string;
  tracks: string | string[];
  policy: string;
  signer: string;
  signerKey?: string;
  signerIv?: string;
}

/** Get keys from a Widevine key server. */
export async function getKeys(opts: GetKeysOptions): Promise<Record<string, unknown>> {
  let tracks = opts.tracks;
  if (typeof tracks === "string") tracks = tracks.toUpperCase().split(",");

  const trackList = tracks
    .filter((t) => VALID_TRACKS.includes(t))
    .map((t) => ({ type: t }));

  const request = {
    // content_id is base64(ascii(contentId)) as an ASCII string.
    content_id: b64encode(toBytes(opts.contentId)),
    policy: opts.policy,
    drm_types: ["WIDEVINE"],
    tracks: trackList,
  };

  const requestData: Record<string, string> = {
    request: b64encode(toBytes(JSON.stringify(request))),
    signer: opts.signer,
  };

  if (opts.signerKey != null && opts.signerIv != null) {
    requestData.signature = await signRequest(request, opts.signerKey, opts.signerIv);
  }

  const r = await fetch(opts.url, { method: "POST", body: JSON.stringify(requestData) });
  if (r.status !== 200) throw new Error(`Widevine request failed with status code ${r.status}`);

  const body = (await r.json()) as { response: string };
  return JSON.parse(fromBytes(b64decode(body.response)));
}

export interface WidevineDataOptions {
  keyIds?: KeyIdInput[];
  provider?: string;
  contentId?: string | Uint8Array;
  protectionScheme?: string;
}

/**
 * Generate a Widevine CENC header protobuf message. Requires either a list of
 * key IDs or a content ID.
 */
export function generateWidevineData(opts: WidevineDataOptions = {}): protobuf.Message {
  if (opts.keyIds == null && opts.contentId == null) {
    throw new Error("Must provide either list of key IDs or content ID");
  }

  // protob.js exposes proto fields in camelCase.
  const payload: Record<string, unknown> = {};
  if (opts.provider != null) payload.provider = opts.provider;

  if (opts.keyIds != null) {
    payload.keyId = opts.keyIds.map(keyIdToBytes);
  }

  if (opts.contentId != null) {
    payload.contentId = typeof opts.contentId === "string" ? toBytes(opts.contentId) : opts.contentId;
  }

  if (opts.protectionScheme != null && opts.protectionScheme in PROTECTION_SCHEME) {
    payload.protectionScheme = PROTECTION_SCHEME[opts.protectionScheme];
  }

  return WidevineCencHeader.create(payload);
}

/** Serialize a Widevine CENC header to bytes (equivalent of `SerializeToString`). */
export function serializeWidevineData(msg: protobuf.Message): Uint8Array {
  return WidevineCencHeader.encode(msg).finish();
}

export interface PsshOptions {
  keyIds: KeyIdInput[];
  provider?: string;
  contentId?: string | Uint8Array;
  version?: number;
  protectionScheme?: string;
}

/** Generate a Widevine PSSH box (defaults to version 1 with key IDs listed). */
export function generatePssh(opts: PsshOptions): Uint8Array {
  if (opts.keyIds == null) throw new Error("Must provide a list of key IDs");

  const kids = opts.keyIds.map(keyIdToBytes);

  const psshData = generateWidevineData({
    keyIds: kids,
    provider: opts.provider,
    contentId: opts.contentId,
    protectionScheme: opts.protectionScheme,
  });

  return buildPsshBox({
    version: opts.version ?? 1,
    systemId: WIDEVINE_SYSTEM_ID.bytes,
    keyIds: kids,
    data: serializeWidevineData(psshData),
  });
}
