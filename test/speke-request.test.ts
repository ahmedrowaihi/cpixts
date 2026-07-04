import { describe, it, expect } from "vitest";
import { validate } from "../src/index.js";
import { buildSpekeRequest, validateSpekeRequest } from "../src/speke/index.js";

const KID = "0dc3ec4f-7683-548b-81e7-3c64e582e136";
const WIDEVINE = "edef8ba9-79d6-4ace-a3c8-27dcd51d21ed";

describe("buildSpekeRequest", () => {
  it("v1.0: no version attribute, no commonEncryptionScheme, no rotation block", () => {
    const cpix = buildSpekeRequest({
      version: "1.0",
      keyIds: [KID],
      drmSystems: [{ systemId: WIDEVINE }],
      commonEncryptionScheme: "cenc", // ignored for v1
    });
    const xml = cpix.toString();
    expect(cpix.periods.length).toBe(0);
    expect(xml).not.toContain("version=");
    expect(xml).not.toContain("commonEncryptionScheme");
    expect(xml).not.toContain("ContentKeyPeriodList");
    expect(validate(xml)[0]).toBe(true);
  });

  it("v1.0: passing rotation throws", () => {
    expect(() =>
      buildSpekeRequest({
        version: "1.0",
        keyIds: [KID],
        drmSystems: [{ systemId: WIDEVINE }],
        rotation: { periods: [{ index: 0 }] },
      }),
    ).toThrow();
  });

  it("v2.0 with rotation: emits ContentKeyPeriodList and commonEncryptionScheme", () => {
    const cpix = buildSpekeRequest({
      version: "2.0",
      contentId: "movie-1",
      keyIds: [KID],
      drmSystems: [{ systemId: WIDEVINE }],
      commonEncryptionScheme: "cbcs",
      rotation: { periods: [{ index: 0 }, { index: 1 }] },
    });
    const xml = cpix.toString();
    expect(cpix.periods.length).toBe(2);
    expect(xml).toContain('version="2.3"');
    expect(xml).toContain('commonEncryptionScheme="cbcs"');
    expect(xml).toContain("ContentKeyPeriodList");
    expect(validate(xml)[0]).toBe(true);
  });

  it("creates one DRMSystem per (kid × system)", () => {
    const cpix = buildSpekeRequest({
      version: "2.0",
      keyIds: [KID, "1447b7ed-2f66-572b-bd13-06ce7cf3610d"],
      drmSystems: [{ systemId: WIDEVINE }, { systemId: "9a04f079-9840-4286-ab92-e65be0885f95" }],
    });
    expect(cpix.drmSystems.length).toBe(4);
    expect(cpix.contentKeys.length).toBe(2);
  });
});

describe("validateSpekeRequest", () => {
  it("passes a well-formed request", () => {
    const cpix = buildSpekeRequest({ version: "2.0", keyIds: [KID], drmSystems: [{ systemId: WIDEVINE }] });
    expect(validateSpekeRequest(cpix)).toEqual([true, []]);
  });

  it("flags a rotation block on a v1 request", () => {
    const cpix = buildSpekeRequest({
      version: "2.0",
      keyIds: [KID],
      drmSystems: [{ systemId: WIDEVINE }],
      rotation: { periods: [{ index: 0 }] },
    });
    cpix.version = "2.2"; // downgrade to v1 while keeping the rotation block
    const [ok, errors] = validateSpekeRequest(cpix);
    expect(ok).toBe(false);
    expect(errors.some((e) => e.includes("ContentKeyPeriodList"))).toBe(true);
  });

  it("flags a request with no content keys", () => {
    const cpix = buildSpekeRequest({ version: "2.0", keyIds: [], drmSystems: [] });
    expect(validateSpekeRequest(cpix)[0]).toBe(false);
  });
});
