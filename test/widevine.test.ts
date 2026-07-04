import { describe, it, expect } from "vitest";
import { drm } from "../src/index.js";
import { Uuid } from "../src/index.js";

const { widevine } = drm;

function hex(b: Uint8Array): string {
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// field2 key_id + field3 provider "widevine_test" + field4 content_id "uspwvtest3"
const SINGLE_DATA_HEX =
  "1210c2faf66e2852cc4c4a751f0a2a941fdb1a0d7769646576696e655f74657374220a75737077767465737433";
const WIDEVINE_SYSTEM_ID_HEX = "edef8ba979d64acea3c827dcd51d21ed";

describe("widevine data", () => {
  it("single key widevine data serializes and round-trips", () => {
    const kids = ["C2FAF66E2852CC4C4A751F0A2A941FDB"];
    const data = widevine.generateWidevineData({ keyIds: kids, provider: "widevine_test", contentId: "uspwvtest3" });
    const bytes = widevine.serializeWidevineData(data);
    expect(hex(bytes)).toBe(SINGLE_DATA_HEX);

    const parsed = widevine.WidevineCencHeader.decode(bytes) as unknown as {
      keyId: Uint8Array[];
      provider: string;
      contentId: Uint8Array;
    };
    expect(parsed.keyId.map(hex)).toEqual(kids.map((k) => hex(new Uuid(k).bytes)));
    expect(parsed.provider).toBe("widevine_test");
    expect(new TextDecoder().decode(parsed.contentId)).toBe("uspwvtest3");
  });

  it("multi key widevine data round-trips", () => {
    const kids = [
      "C2FAF66E2852CC4C4A751F0A2A941FDB",
      "087BCFC6F7A55716B8406AA6EBA3369E",
      "0D6B40238DA15E75AF6875C514C59B63",
    ];
    const data = widevine.generateWidevineData({ keyIds: kids, provider: "widevine_test", contentId: "uspwvtest3" });
    const bytes = widevine.serializeWidevineData(data);
    const parsed = widevine.WidevineCencHeader.decode(bytes) as unknown as { keyId: Uint8Array[] };
    expect(parsed.keyId.map(hex)).toEqual(kids.map((k) => hex(new Uuid(k).bytes)));
  });
});

describe("widevine pssh", () => {
  it("single key v0 pssh", () => {
    const pssh = widevine.generatePssh({
      keyIds: ["C2FAF66E2852CC4C4A751F0A2A941FDB"],
      provider: "widevine_test",
      contentId: "uspwvtest3",
      version: 0,
    });
    const expected = "0000004d" + "70737368" + "00" + "000000" + WIDEVINE_SYSTEM_ID_HEX + "0000002d" + SINGLE_DATA_HEX;
    expect(hex(pssh)).toBe(expected);
  });

  it("v1 pssh includes key ids", () => {
    const pssh = widevine.generatePssh({
      keyIds: ["C2FAF66E2852CC4C4A751F0A2A941FDB"],
      provider: "widevine_test",
      contentId: "uspwvtest3",
    });
    // "pssh" box, version 1, flags 0, then key_id count = 1 and the kid
    expect(hex(pssh).slice(8)).toContain("70737368" + "01" + "000000" + WIDEVINE_SYSTEM_ID_HEX + "00000001c2faf66e2852cc4c4a751f0a2a941fdb");
  });
});
