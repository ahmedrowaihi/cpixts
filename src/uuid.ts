/**
 * Minimal RFC-4122 UUID value type mirroring the subset of Python's
 * `uuid.UUID` used here: canonical lowercase string form,
 * big-endian `bytes`, and little-endian `bytesLe`.
 */

const HEX = /^[0-9a-f]{32}$/;

function normalizeHex(value: string): string {
  const hex = value
    .trim()
    .replace(/^urn:uuid:/i, "")
    .replace(/[{}]/g, "")
    .replace(/-/g, "")
    .toLowerCase();
  if (!HEX.test(hex)) throw new Error(`badly formed hexadecimal UUID string: ${value}`);
  return hex;
}

export class Uuid {
  /** 16 raw bytes, big-endian (matches Python `UUID.bytes`). */
  readonly bytes: Uint8Array;

  constructor(value: string | Uuid | Uint8Array) {
    if (value instanceof Uuid) {
      this.bytes = value.bytes.slice();
      return;
    }
    if (value instanceof Uint8Array) {
      if (value.length !== 16) throw new Error("bytes is not a 16-char string");
      this.bytes = value.slice();
      return;
    }
    const hex = normalizeHex(value);
    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    this.bytes = bytes;
  }

  /** 16 raw bytes, little-endian (matches Python `UUID.bytes_le`). */
  get bytesLe(): Uint8Array {
    const b = this.bytes;
    return new Uint8Array([
      b[3], b[2], b[1], b[0], // time_low
      b[5], b[4], // time_mid
      b[7], b[6], // time_hi_and_version
      b[8], b[9], // clock_seq
      b[10], b[11], b[12], b[13], b[14], b[15], // node
    ]);
  }

  /** Canonical lowercase hyphenated form (matches `str(UUID)`). */
  toString(): string {
    let hex = "";
    for (const byte of this.bytes) hex += byte.toString(16).padStart(2, "0");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  equals(other: Uuid): boolean {
    if (this.bytes.length !== other.bytes.length) return false;
    return this.bytes.every((b, i) => b === other.bytes[i]);
  }
}

/** Coerce a string/UUID into a {@link Uuid}, throwing for other types. */
export function toUuid(value: string | Uuid): Uuid {
  if (value instanceof Uuid) return value;
  if (typeof value === "string") return new Uuid(value);
  throw new TypeError("should be a uuid");
}
