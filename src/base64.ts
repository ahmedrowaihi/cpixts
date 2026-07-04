/**
 * Isomorphic base64 / base16 helpers over `Uint8Array`, mirroring the parts of
 * Python's `base64` module used here (`b64encode/decode`, `b16encode/decode`).
 */

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const B64_LOOKUP = (() => {
  const t = new Int8Array(256).fill(-1);
  for (let i = 0; i < B64.length; i++) t[B64.charCodeAt(i)] = i;
  return t;
})();

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** Coerce a base64 `string` (or already-decoded bytes) to bytes for input. */
function asString(value: string | Uint8Array): string {
  return typeof value === "string" ? value : decoder.decode(value);
}

export function b64encode(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    out += b1 === undefined ? "=" : B64[((b1 & 15) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    out += b2 === undefined ? "=" : B64[b2 & 63];
  }
  return out;
}

/**
 * Decode base64. Throws on malformed input, standing in for Python's
 * `binascii.Error` which is caught to reject invalid base64.
 */
export function b64decode(value: string | Uint8Array): Uint8Array {
  // Python's base64.b64decode(validate=False) discards any character outside
  // the alphabet before decoding; mirror that leniency (covers whitespace and
  // stray punctuation in e.g. Widevine key-server responses).
  const s = asString(value).replace(/[^A-Za-z0-9+/=]/g, "");
  if (s.length % 4 !== 0) throw new Error("Invalid base64-encoded string");
  const clean = s.replace(/=+$/, "");
  const out = new Uint8Array((clean.length * 3) >> 2);
  let bits = 0;
  let acc = 0;
  let o = 0;
  for (const ch of clean) {
    const v = B64_LOOKUP[ch.charCodeAt(0)];
    if (v === -1) throw new Error("Invalid base64-encoded string");
    acc = (acc << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[o++] = (acc >> bits) & 0xff;
    }
  }
  return out;
}

/** UTF-8 encode a string to bytes (helper for `bytes(s, "ASCII"/"UTF-8")`). */
export function toBytes(s: string): Uint8Array {
  return encoder.encode(s);
}

/** UTF-8 decode bytes to a string (helper for `str(b, "ASCII"/"UTF-8")`). */
export function fromBytes(b: Uint8Array): string {
  return decoder.decode(b);
}

/** Uppercase hex, matching Python `binascii.b2a_hex`/`base64.b16encode`. */
export function b16encode(bytes: Uint8Array): string {
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0").toUpperCase();
  return out;
}

export function b16decode(value: string | Uint8Array): Uint8Array {
  const s = asString(value);
  if (s.length % 2 !== 0) throw new Error("Odd-length string");
  // Validate the whole string up front — parseInt is a prefix parser and
  // would silently accept e.g. "1z" as 0x01.
  if (!/^[0-9A-Fa-f]*$/.test(s)) throw new Error("Non-hexadecimal digit found");
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}
