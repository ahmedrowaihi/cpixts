import { describe, it, expect } from "vitest";
import {
  CPIX,
  ContentKey,
  ContentKeyList,
  DRMSystem,
  LabelFilter,
  Period,
  validate,
} from "../src/index.js";
import { b16decode, b64decode } from "../src/base64.js";

// Regression tests for the correctness review fixes.

describe("XSD accepts library output (commonEncryptionScheme)", () => {
  it("validates a document the library itself generates", () => {
    const xml = new CPIX({
      contentKeys: new ContentKeyList(
        new ContentKey({ kid: "0dc3ec4f-7683-548b-81e7-3c64e582e136", cek: "WADwG2qCqkq5TVml+U5PXw==" }),
      ),
    }).toString();
    expect(xml).toContain('commonEncryptionScheme="cenc"');
    expect(validate(xml)).toEqual([true, ""]);
  });
});

describe("DRMSystem.smoothStreamingProtectionHeaderData", () => {
  it("emits and round-trips", () => {
    const drm = new DRMSystem({
      kid: "1447b7ed-2f66-572b-bd13-06ce7cf3610d",
      systemId: "9a04f079-9840-4286-ab92-e65be0885f95",
      smoothStreamingProtectionHeaderData: "some-mss-header",
    });
    const xml = drm.toString();
    expect(xml).toContain("<SmoothStreamingProtectionHeaderData>some-mss-header</SmoothStreamingProtectionHeaderData>");
    expect(DRMSystem.parse(xml).smoothStreamingProtectionHeaderData).toBe("some-mss-header");
  });
});

describe("Period datetime offset/naive preservation", () => {
  it("preserves a non-Z UTC offset", () => {
    expect(new Period({ id: "t", start: "2018-08-06T00:00:00+02:00" }).toString()).toContain(
      'start="2018-08-06T00:00:00+02:00"',
    );
  });
  it("preserves a naive datetime (no suffix)", () => {
    expect(new Period({ id: "t", start: "2018-08-06T00:00:00" }).toString()).toContain(
      'start="2018-08-06T00:00:00"',
    );
  });
  it("throws TypeError with the right field name", () => {
    expect(() => new Period({ id: "t", end: "not-a-date" })).toThrow(/end should be a datetime/);
  });
});

describe("DRMSystem base64 setters reject non-strings", () => {
  it("throws TypeError when assigned null post-construction", () => {
    const drm = new DRMSystem({
      kid: "1447b7ed-2f66-572b-bd13-06ce7cf3610d",
      systemId: "9a04f079-9840-4286-ab92-e65be0885f95",
    });
    // @ts-expect-error deliberately assigning null to a base64 setter
    expect(() => (drm.pssh = null)).toThrow(TypeError);
  });
});

describe("XML attribute control-char escaping (lxml parity)", () => {
  it("escapes tab/newline in attribute values as numeric references", () => {
    expect(new LabelFilter("a\tb\nc").toString()).toBe('<LabelFilter label="a&#9;b&#10;c"/>');
  });
});

describe("base64/base16 decode edge cases", () => {
  it("b16decode rejects invalid hex instead of prefix-parsing", () => {
    expect(() => b16decode("1z")).toThrow();
  });
  it("b64decode strips non-alphabet chars (lenient, like Python validate=False)", () => {
    // whitespace/punctuation ignored, valid payload still decodes
    expect(b64decode("WA Dw\nG2qCqkq5TVml+U5PXw==")).toEqual(b64decode("WADwG2qCqkq5TVml+U5PXw=="));
  });
});
