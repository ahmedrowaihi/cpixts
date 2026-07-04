/**
 * PlayReady DRM helpers: content-key derivation, key checksum, WRMHEADER and
 * PSSH generation.
 *
 * Note: these are async (unlike the Python originals) because WebCrypto is
 * promise-based. AES-ECB is emulated via AES-CBC with a zero IV — the first
 * cipher block of CBC-with-zero-IV equals ECB of that block.
 */
import { Element, subElement, tostring } from "../xml.js";
import { Uuid } from "../uuid.js";
import { b16decode, b16encode, b64encode, b64decode } from "../base64.js";
import { PLAYREADY_SYSTEM_ID } from "../constants.js";
import { buildPsshBox } from "./pssh-box.js";
import { ValueError } from "../errors.js";

export { PLAYREADY_SYSTEM_ID };

const PLAYREADY_HEADER_NS = "http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader";
const encoder = new TextEncoder();

type KeyIdInput = string | Uuid | Uint8Array;

function toKeyIdUuid(keyId: KeyIdInput): Uuid {
  if (keyId instanceof Uuid) return keyId;
  if (keyId instanceof Uint8Array) return new Uuid(new TextDecoder().decode(keyId));
  return new Uuid(keyId);
}

function asBytes(value: string | Uint8Array): Uint8Array {
  return typeof value === "string" ? encoder.encode(value) : value;
}

/** UTF-16LE encode a JS string (no BOM), matching lxml `encoding="utf-16le"`. */
function utf16le(s: string): Uint8Array {
  const out = new Uint8Array(s.length * 2);
  const view = new DataView(out.buffer);
  for (let i = 0; i < s.length; i++) view.setUint16(i * 2, s.charCodeAt(i), true);
  return out;
}

async function sha256(...chunks: Uint8Array[]): Promise<Uint8Array> {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const buf = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    buf.set(c, offset);
    offset += c.length;
  }
  return new Uint8Array(await crypto.subtle.digest("SHA-256", buf as unknown as ArrayBuffer));
}

/** AES-ECB of a single 16-byte block, via CBC with a zero IV. */
async function aesEcbBlock(key: Uint8Array, block: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key as unknown as ArrayBuffer,
    { name: "AES-CBC" },
    false,
    ["encrypt"],
  );
  const full = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-CBC", iv: new Uint8Array(16) as unknown as ArrayBuffer },
      cryptoKey,
      block as unknown as ArrayBuffer,
    ),
  );
  return full.slice(0, 16);
}

/** Derive a content key (uppercase hex) from a key ID and base64 key seed. */
export async function generateContentKey(
  keyId: KeyIdInput,
  keySeed: string | Uint8Array,
): Promise<string> {
  if (keySeed.length < 30) throw new Error("seed must be >= 30 bytes");
  const seed = b64decode(keySeed);
  const kid = toKeyIdUuid(keyId).bytesLe;

  const shaA = await sha256(seed, kid);
  const shaB = await sha256(seed, kid, seed);
  const shaC = await sha256(seed, kid, seed, kid);

  const contentKey = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    contentKey[i] =
      shaA[i] ^ shaA[i + 16] ^ shaB[i] ^ shaB[i + 16] ^ shaC[i] ^ shaC[i + 16];
  }
  return b16encode(contentKey);
}

/**
 * Generate the PlayReady key checksum: AES-ECB encrypt the 16-byte key ID with
 * the 16-byte content key, then base64-encode the first 8 bytes.
 *
 * @see https://learn.microsoft.com/en-us/playready/specifications/playready-header-specification (Key Checksum)
 */
export async function checksum(kid: KeyIdInput, cek: string | Uint8Array): Promise<string> {
  const kidUuid = toKeyIdUuid(kid);
  const cipher = await aesEcbBlock(b16decode(cek), kidUuid.bytesLe);
  return b64encode(cipher.slice(0, 8));
}

export interface PlayReadyKey {
  key_id: KeyIdInput;
  key?: string | Uint8Array;
}

/** Generate a PlayReady header (4.2 for AESCTR, 4.3 for AESCBC). */
export async function generateWrmheader(
  keys: PlayReadyKey[],
  url: string,
  algorithm: "AESCTR" | "AESCBC" = "AESCTR",
  useChecksum = true,
): Promise<Uint8Array> {
  if (algorithm !== "AESCTR" && algorithm !== "AESCBC")
    throw new ValueError("algorithm must be AESCTR or AESCBC");

  const wrmheader = new Element("WRMHEADER", [[null, PLAYREADY_HEADER_NS]]);
  wrmheader.set("version", algorithm === "AESCBC" ? "4.3.0.0" : "4.2.0.0");

  const data = subElement(wrmheader, "DATA");
  const protectInfo = subElement(data, "PROTECTINFO");
  const kids = subElement(protectInfo, "KIDS");

  for (const key of keys) {
    const kidUuid = toKeyIdUuid(key.key_id);
    const kid = new Element("KID");
    kid.set("ALGID", algorithm);
    if (algorithm === "AESCTR" && useChecksum) {
      if (key.key == null) throw new ValueError("key is required to compute checksum");
      kid.set("CHECKSUM", await checksum(kidUuid, key.key));
    }
    kid.set("VALUE", b64encode(kidUuid.bytesLe));
    kid.text = "";
    kids.append(kid);
  }

  const laUrl = subElement(data, "LA_URL");
  laUrl.text = url;

  return utf16le(tostring(wrmheader));
}

function u16le(value: number): Uint8Array {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, value, true);
  return b;
}

function u32le(value: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, value, true);
  return b;
}

/** Wrap a WRMHEADER in a PlayReady object. */
export function generatePlayreadyObject(wrmheader: Uint8Array): Uint8Array {
  const parts = [
    u32le(wrmheader.length + 10), // overall length
    u16le(1), // record count
    u16le(1), // record type
    u16le(wrmheader.length), // wrmheader length
    wrmheader,
  ];
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

/** Generate a PlayReady PSSH box including the PlayReady header. */
export async function generatePssh(
  keys: PlayReadyKey[],
  url: string,
  algorithm: "AESCTR" | "AESCBC" = "AESCTR",
  useChecksum = true,
  version = 1,
): Promise<Uint8Array> {
  const wrmheader = await generateWrmheader(keys, url, algorithm, useChecksum);
  const pro = generatePlayreadyObject(wrmheader);

  return buildPsshBox({
    version,
    systemId: PLAYREADY_SYSTEM_ID.bytes,
    keyIds: keys.map((key) => toKeyIdUuid(key.key_id).bytes),
    data: pro,
  });
}
