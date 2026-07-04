import { describe, it, expect } from "vitest";
import {
  CPIX,
  ContentKey,
  ContentKeyList,
  DRMSystem,
  DRMSystemList,
  UsageRule,
  UsageRuleList,
  VideoFilter,
  AudioFilter,
  validate,
} from "../src/index.js";
import { handleSpeke, validateSpekeV2, type SpekeKeyProvider } from "../src/speke/index.js";

const VIDEO_KID = "0dc3ec4f-7683-548b-81e7-3c64e582e136";
const AUDIO_KID = "1447b7ed-2f66-572b-bd13-06ce7cf3610d";
const WIDEVINE = "edef8ba9-79d6-4ace-a3c8-27dcd51d21ed";
const PLAYREADY = "9a04f079-9840-4286-ab92-e65be0885f95";

// Deterministic keys so the response is stable.
const fixedKeys: Record<string, string> = {
  [VIDEO_KID]: "WADwG2qCqkq5TVml+U5PXw==",
  [AUDIO_KID]: "ydugVLA+K017XoGM4mjxvA==",
};
const keyProvider: SpekeKeyProvider = { getKey: (kid) => ({ cek: fixedKeys[kid] }) };

/** A SPEKE request: kids without keys, DRM systems without PSSH, usage rules. */
function requestXml(): string {
  return new CPIX({
    contentId: "test-content",
    version: "2.3",
    contentKeys: new ContentKeyList(
      new ContentKey({ kid: VIDEO_KID }),
      new ContentKey({ kid: AUDIO_KID }),
    ),
    drmSystems: new DRMSystemList(
      new DRMSystem({ kid: VIDEO_KID, systemId: WIDEVINE }),
      new DRMSystem({ kid: VIDEO_KID, systemId: PLAYREADY }),
      new DRMSystem({ kid: AUDIO_KID, systemId: WIDEVINE }),
    ),
    usageRules: new UsageRuleList(
      new UsageRule({ kid: VIDEO_KID, filters: [new VideoFilter()], intendedTrackType: "VIDEO" }),
      new UsageRule({ kid: AUDIO_KID, filters: [new AudioFilter()], intendedTrackType: "AUDIO" }),
    ),
  }).toString();
}

describe("handleSpeke", () => {
  it("fills in content keys and DRM PSSH, producing a schema-valid response", async () => {
    const responseXml = await handleSpeke(requestXml(), {
      keyProvider,
      widevineProvider: "test",
      playreadyLaUrl: "https://example.com/pr",
    });
    const response = CPIX.parse(responseXml);

    // keys populated
    expect(response.contentKeys[0].cek).toBe(fixedKeys[VIDEO_KID]);
    expect(response.contentKeys[1].cek).toBe(fixedKeys[AUDIO_KID]);

    // every DRM system got a PSSH
    for (const drm of response.drmSystems) {
      expect(drm.pssh).toBeTruthy();
      expect(typeof drm.pssh).toBe("string");
    }

    // schema-valid (CPIX 2.3) and SPEKE-valid
    expect(validate(responseXml)[0]).toBe(true);
    expect(validateSpekeV2(response)).toEqual([true, []]);
  });

  it("runs a caller-registered DRM provider (e.g. ClearKey)", async () => {
    const CLEARKEY = "1077efec-c0b2-4d02-ace3-3c1e52e2fb4b";
    const req = new CPIX({
      contentId: "c",
      contentKeys: new ContentKeyList(new ContentKey({ kid: VIDEO_KID })),
      drmSystems: new DRMSystemList(new DRMSystem({ kid: VIDEO_KID, systemId: CLEARKEY })),
    }).toString();

    const response = CPIX.parse(
      await handleSpeke(req, {
        keyProvider,
        drmProviders: {
          [CLEARKEY]: ({ drm, cek }) => {
            // a ClearKey signaling provider echoing the key as ContentProtectionData
            drm.contentProtectionData = cek!;
          },
        },
      }),
    );
    expect(response.drmSystems[0].contentProtectionData).toBe(fixedKeys[VIDEO_KID]);
    expect(response.drmSystems[0].pssh).toBeNull();
  });

  it("leaves an already-provided PSSH untouched", async () => {
    const preset = new CPIX({
      contentId: "c",
      contentKeys: new ContentKeyList(new ContentKey({ kid: VIDEO_KID, cek: fixedKeys[VIDEO_KID] })),
      drmSystems: new DRMSystemList(new DRMSystem({ kid: VIDEO_KID, systemId: WIDEVINE, pssh: "QUFBQQ==" })),
    }).toString();
    const response = CPIX.parse(await handleSpeke(preset, { keyProvider }));
    expect(response.drmSystems[0].pssh).toBe("QUFBQQ==");
  });
});

describe("validateSpekeV2", () => {
  const base = () =>
    new CPIX({
      contentKeys: new ContentKeyList(new ContentKey({ kid: VIDEO_KID, cek: fixedKeys[VIDEO_KID] })),
      usageRules: new UsageRuleList(
        new UsageRule({ kid: VIDEO_KID, filters: [new VideoFilter()], intendedTrackType: "VIDEO" }),
      ),
    });

  it("passes a well-formed SPEKE document", () => {
    expect(validateSpekeV2(base())).toEqual([true, []]);
  });

  it("flags a missing intendedTrackType", () => {
    const cpix = new CPIX({
      contentKeys: new ContentKeyList(new ContentKey({ kid: VIDEO_KID, cek: fixedKeys[VIDEO_KID] })),
      usageRules: new UsageRuleList(new UsageRule({ kid: VIDEO_KID, filters: [new VideoFilter()] })),
    });
    const [ok, errors] = validateSpekeV2(cpix);
    expect(ok).toBe(false);
    expect(errors.some((e) => e.includes("missing intendedTrackType"))).toBe(true);
  });

  it("flags duplicate intendedTrackType", () => {
    const cpix = new CPIX({
      contentKeys: new ContentKeyList(
        new ContentKey({ kid: VIDEO_KID, cek: fixedKeys[VIDEO_KID] }),
        new ContentKey({ kid: AUDIO_KID, cek: fixedKeys[AUDIO_KID] }),
      ),
      usageRules: new UsageRuleList(
        new UsageRule({ kid: VIDEO_KID, filters: [new VideoFilter()], intendedTrackType: "VIDEO" }),
        new UsageRule({ kid: AUDIO_KID, filters: [new AudioFilter()], intendedTrackType: "VIDEO" }),
      ),
    });
    expect(validateSpekeV2(cpix)[1].some((e) => e.includes("duplicate intendedTrackType"))).toBe(true);
  });

  it("flags non-uniform commonEncryptionScheme", () => {
    const cpix = new CPIX({
      contentKeys: new ContentKeyList(
        new ContentKey({ kid: VIDEO_KID, cek: fixedKeys[VIDEO_KID], commonEncryptionScheme: "cenc" }),
        new ContentKey({ kid: AUDIO_KID, cek: fixedKeys[AUDIO_KID], commonEncryptionScheme: "cbcs" }),
      ),
    });
    expect(validateSpekeV2(cpix)[1].some((e) => e.includes("commonEncryptionScheme must be uniform"))).toBe(true);
  });

  it('enforces the ALL track-type shape', () => {
    const cpix = new CPIX({
      contentKeys: new ContentKeyList(new ContentKey({ kid: VIDEO_KID, cek: fixedKeys[VIDEO_KID] })),
      usageRules: new UsageRuleList(
        // ALL requires exactly one empty AudioFilter + one empty VideoFilter
        new UsageRule({ kid: VIDEO_KID, filters: [new VideoFilter({ maxPixels: 100 })], intendedTrackType: "ALL" }),
      ),
    });
    expect(validateSpekeV2(cpix)[1].some((e) => e.includes('"ALL"'))).toBe(true);
  });
});
