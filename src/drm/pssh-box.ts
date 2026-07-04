/**
 * Builder for the ISO-BMFF `pssh` box, replacing the Python `construct`
 * declarative struct. Layout (big-endian):
 *
 *   u32 total_length (includes these 4 bytes)
 *   "pssh"
 *   u8  version
 *   u24 flags (0)
 *   16  system_id
 *   [ u32 key_id_count, key_id*16 ]   // only when version == 1
 *   u32 data_length, data
 */

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

function u32be(value: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, value, false);
  return b;
}

export interface PsshBoxInput {
  version: number;
  systemId: Uint8Array; // 16 bytes
  keyIds: Uint8Array[]; // each 16 bytes; only emitted when version == 1
  data: Uint8Array;
}

export function buildPsshBox({ version, systemId, keyIds, data }: PsshBoxInput): Uint8Array {
  const parts: Uint8Array[] = [
    new TextEncoder().encode("pssh"),
    new Uint8Array([version]),
    new Uint8Array([0, 0, 0]), // flags
    systemId,
  ];
  if (version === 1) {
    parts.push(u32be(keyIds.length));
    for (const kid of keyIds) parts.push(kid);
  }
  parts.push(u32be(data.length));
  parts.push(data);

  const body = concat(parts);
  // includelength: total length counts the 4-byte length field itself.
  return concat([u32be(body.length + 4), body]);
}
