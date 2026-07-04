import { describe, it, expect } from "vitest";
import { drm, PLAYREADY_SYSTEM_ID } from "../src/index.js";

const { playready } = drm;

const KEY_SEED = "XVBovsmzhP9gRIZxWfFta3VVRPzVEWmJsazEJ46I";
const URL = "https://test.playready.microsoft.com/service/rightsmanager.asmx";
const KID = "8ba94ade-6eb9-449d-b44f-a5beefaf43b0";
const CEK = "DBFD6922C321C4BB486F4A1C44097ED6";

const EXPECTED_WRMHEADER =
  '<WRMHEADER xmlns="http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="4.2.0.0"><DATA><PROTECTINFO><KIDS><KID ALGID="AESCTR" CHECKSUM="Me48z71nuqY=" VALUE="3kqpi7lunUS0T6W+769DsA=="></KID></KIDS></PROTECTINFO><LA_URL>https://test.playready.microsoft.com/service/rightsmanager.asmx</LA_URL></DATA></WRMHEADER>';

const decodeUtf16le = (b: Uint8Array) => new TextDecoder("utf-16le").decode(b);
const u16le = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8);
const u32be = (b: Uint8Array, o: number) => (b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3];

describe("playready", () => {
  it("generate content key", async () => {
    expect(await playready.generateContentKey(KID, KEY_SEED)).toBe(CEK);
  });

  it("checksum", async () => {
    expect(await playready.checksum(KID, CEK)).toBe("Me48z71nuqY=");
  });

  it("generate wrmheader (utf-16le)", async () => {
    const wrmheader = await playready.generateWrmheader([{ key_id: KID, key: CEK }], URL);
    expect(wrmheader[0]).toBe(0x3c); // '<'
    expect(wrmheader[1]).toBe(0x00); // little-endian
    expect(decodeUtf16le(wrmheader)).toBe(EXPECTED_WRMHEADER);
  });

  it("generate wrmheader without checksum", async () => {
    const wrmheader = await playready.generateWrmheader([{ key_id: KID }], URL, "AESCTR", false);
    expect(decodeUtf16le(wrmheader)).not.toContain("CHECKSUM");
    expect(decodeUtf16le(wrmheader)).toContain('VALUE="3kqpi7lunUS0T6W+769DsA=="');
  });

  it("generate playready object", async () => {
    const wrmheader = await playready.generateWrmheader([{ key_id: KID, key: CEK }], URL);
    const pro = playready.generatePlayreadyObject(wrmheader);

    expect(pro.length).toBe(wrmheader.length + 10);
    // overall length (LE) = wrmheader.length + 10
    expect(pro[0] | (pro[1] << 8) | (pro[2] << 16) | (pro[3] << 24)).toBe(wrmheader.length + 10);
    expect(u16le(pro, 4)).toBe(1); // record count
    expect(u16le(pro, 6)).toBe(1); // record type
    expect(u16le(pro, 8)).toBe(wrmheader.length); // wrmheader length
    expect([...pro.slice(10)]).toEqual([...wrmheader]);
  });

  it("generate v1 pssh", async () => {
    const pssh = await playready.generatePssh([{ key_id: KID, key: CEK }], URL);
    const wrmheader = await playready.generateWrmheader([{ key_id: KID, key: CEK }], URL);
    const pro = playready.generatePlayreadyObject(wrmheader);

    expect(u32be(pssh, 0)).toBe(pssh.length); // includelength
    expect(new TextDecoder().decode(pssh.slice(4, 8))).toBe("pssh");
    expect(pssh[8]).toBe(1); // version
    const systemId = pssh.slice(12, 28);
    expect([...systemId]).toEqual([...PLAYREADY_SYSTEM_ID.bytes]);
    // version 1: key_id count then kid, then data length + pro
    expect(u32be(pssh, 28)).toBe(1);
    expect([...pssh.slice(pssh.length - pro.length)]).toEqual([...pro]);
  });

  it("generate v0 pssh omits key ids", async () => {
    const pssh = await playready.generatePssh([{ key_id: KID, key: CEK }], URL, "AESCTR", true, 0);
    expect(pssh[8]).toBe(0); // version 0
    const systemId = pssh.slice(12, 28);
    expect([...systemId]).toEqual([...PLAYREADY_SYSTEM_ID.bytes]);
    // version 0: no key_id array — data length immediately follows system id
    expect(u32be(pssh, 28)).toBe(pssh.length - 32);
  });
});
