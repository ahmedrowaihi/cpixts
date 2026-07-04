import { describe, it, expect } from "vitest";
import { validate } from "../src/index.js";
import { buildSpekeRequest, validateSpekeRequest } from "../src/speke/index.js";

const KID = "0dc3ec4f-7683-548b-81e7-3c64e582e136";
const WIDEVINE = "edef8ba9-79d6-4ace-a3c8-27dcd51d21ed";

describe("buildSpekeRequest", () => {
  it("v1.0: no version attribute, no commonEncryptionScheme (static single key)", () => {
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
    expect(validate(xml)[0]).toBe(true);
  });

  it("v1.0 supports rotation too: emits ContentKeyPeriodList + KeyPeriodFilter", () => {
    const cpix = buildSpekeRequest({
      version: "1.0",
      keyIds: [KID],
      drmSystems: [{ systemId: WIDEVINE }],
      rotation: { periods: [{ index: 1 }] },
    });
    const xml = cpix.toString();
    expect(cpix.periods.length).toBe(1);
    expect(xml).toContain("ContentKeyPeriodList");
    expect(xml).toContain("KeyPeriodFilter");
    expect(validate(xml)[0]).toBe(true);
  });

  it("v2.0 with rotation: emits ContentKeyPeriodList, KeyPeriodFilter, and commonEncryptionScheme", () => {
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
    expect(xml).toContain("KeyPeriodFilter");
    expect(validate(xml)[0]).toBe(true);
  });

  it("period block is rotation-driven, not version-driven (regression)", () => {
    for (const version of ["1.0", "2.0"] as const) {
      const withoutRotation = buildSpekeRequest({ version, keyIds: [KID], drmSystems: [{ systemId: WIDEVINE }] });
      expect(withoutRotation.toString()).not.toContain("ContentKeyPeriodList");

      const withRotation = buildSpekeRequest({
        version,
        keyIds: [KID],
        drmSystems: [{ systemId: WIDEVINE }],
        rotation: { periods: [{ index: 0 }] },
      });
      expect(withRotation.toString()).toContain("ContentKeyPeriodList");
    }
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

  it("accepts rotation on either version (v1 and v2)", () => {
    for (const version of ["1.0", "2.0"] as const) {
      const cpix = buildSpekeRequest({
        version,
        keyIds: [KID],
        drmSystems: [{ systemId: WIDEVINE }],
        rotation: { periods: [{ index: 1 }] },
      });
      expect(validateSpekeRequest(cpix)).toEqual([true, []]);
    }
  });

  it("flags a ContentKeyPeriodList without a KeyPeriodFilter", () => {
    const cpix = buildSpekeRequest({ version: "2.0", keyIds: [KID], drmSystems: [{ systemId: WIDEVINE }] });
    // add periods but no usage-rule filter binding them
    cpix.periods = buildSpekeRequest({
      version: "2.0",
      keyIds: [KID],
      drmSystems: [{ systemId: WIDEVINE }],
      rotation: { periods: [{ index: 0 }] },
    }).periods;
    const [ok, errors] = validateSpekeRequest(cpix);
    expect(ok).toBe(false);
    expect(errors.some((e) => e.includes("KeyPeriodFilter"))).toBe(true);
  });

  it("flags a request with no content keys", () => {
    const cpix = buildSpekeRequest({ version: "2.0", keyIds: [], drmSystems: [] });
    expect(validateSpekeRequest(cpix)[0]).toBe(false);
  });

  it("caller policy can reject a rotation block (profile concern, not version)", () => {
    const cpix = buildSpekeRequest({
      version: "2.0",
      keyIds: [KID],
      drmSystems: [{ systemId: WIDEVINE }],
      rotation: { periods: [{ index: 0 }] },
    });
    expect(validateSpekeRequest(cpix)[0]).toBe(true); // fine by default
    expect(validateSpekeRequest(cpix, { allowRotation: false })[0]).toBe(false); // rejected by profile
  });
});
