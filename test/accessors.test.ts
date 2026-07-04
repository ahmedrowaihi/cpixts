import { describe, it, expect } from "vitest";
import { CPIX, ContentKey, ContentKeyList, DRMSystem, DRMSystemList } from "../src/index.js";
import { b64encode, b64decode, toBytes } from "../src/base64.js";

const KID = "0dc3ec4f-7683-548b-81e7-3c64e582e136";
const CEK = "WADwG2qCqkq5TVml+U5PXw==";
const WIDEVINE = "edef8ba9-79d6-4ace-a3c8-27dcd51d21ed";
const FAIRPLAY = "94ce86fb-07ff-4f43-adb8-93d2fa968ca2";

describe("CPIX accessors", () => {
  const hls = '#EXT-X-KEY:METHOD=SAMPLE-AES,URI="skd://abc",KEYFORMAT="com.apple.streamingkeydelivery"';
  const doc = new CPIX({
    contentKeys: new ContentKeyList(new ContentKey({ kid: KID, cek: CEK })),
    drmSystems: new DRMSystemList(
      new DRMSystem({ kid: KID, systemId: WIDEVINE, pssh: "QUFBQQ==" }),
      new DRMSystem({ kid: KID, systemId: FAIRPLAY, hlsSignalingData: b64encode(toBytes(hls)) }),
    ),
  });

  it("keyFor returns the content key or undefined", () => {
    expect(doc.keyFor(KID)?.cek).toBe(CEK);
    expect(doc.keyFor("11111111-1111-1111-1111-111111111111")).toBeUndefined();
  });

  it("psshFor returns the base64 PSSH or undefined", () => {
    expect(doc.psshFor(WIDEVINE)).toBe("QUFBQQ==");
    expect(doc.psshFor(FAIRPLAY)).toBeUndefined();
  });

  it("hlsKeyUriFor extracts the URI from the media signaling data", () => {
    expect(doc.hlsKeyUriFor(FAIRPLAY)).toBe("skd://abc");
    expect(doc.hlsKeyUriFor(WIDEVINE)).toBeUndefined();
  });

  it("systems returns all DRM systems", () => {
    expect(doc.systems().length).toBe(2);
  });
});

// Wrap a content key exactly as an xmlenc AES-256-CBC EncryptedValue would:
// ciphertext is IV || AES-CBC(cek), base64-encoded.
async function wrapKey(docKey: Uint8Array, iv: Uint8Array, cek: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey("raw", docKey as unknown as ArrayBuffer, { name: "AES-CBC" }, false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CBC", iv: iv as unknown as ArrayBuffer }, key, cek as unknown as ArrayBuffer));
  const combined = new Uint8Array(iv.length + ct.length);
  combined.set(iv);
  combined.set(ct, iv.length);
  return b64encode(combined);
}

describe("ContentKey.decrypt (document-key-wrapped CEK)", () => {
  const docKey = Uint8Array.from({ length: 32 }, (_, i) => i); // fixed 0..31
  const iv = new Uint8Array(16).fill(7);
  const cek = toBytes("0123456789abcdef"); // a known 16-byte key

  it("recovers the plaintext content key (raw and base64 document key)", async () => {
    const cipherValue = await wrapKey(docKey, iv, cek);
    const ck = new ContentKey({ kid: KID, cek: cipherValue, valueMac: "AAAA" });

    expect([...b64decode(await ck.decrypt(docKey))]).toEqual([...cek]);
    expect([...b64decode(await ck.decrypt(b64encode(docKey)))]).toEqual([...cek]);
  });

  it("throws on a plain (unencrypted) content key", async () => {
    const ck = new ContentKey({ kid: KID, cek: CEK }); // no ValueMAC → not encrypted
    await expect(ck.decrypt(docKey)).rejects.toThrow();
  });
});
