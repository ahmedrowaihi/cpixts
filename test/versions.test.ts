import { describe, it, expect } from "vitest";
import {
  CPIX,
  ContentKey,
  ContentKeyList,
  DRMSystem,
  DRMSystemList,
  validate,
  SUPPORTED_CPIX_VERSIONS,
  LATEST_CPIX_VERSION,
} from "../src/index.js";

const KID = "0dc3ec4f-7683-548b-81e7-3c64e582e136";
const CEK = "WADwG2qCqkq5TVml+U5PXw==";

// commonEncryptionScheme is a 2.3+ feature; the default (latest) output has it.
const doc = new CPIX({
  contentKeys: new ContentKeyList(new ContentKey({ kid: KID, cek: CEK })),
}).toString();

// A plain document valid across all versions (no version-specific constructs).
const plain =
  '<CPIX xmlns="urn:dashif:org:cpix" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:enc="http://www.w3.org/2001/04/xmlenc#" xsi:schemaLocation="urn:dashif:org:cpix cpix.xsd"><ContentKeyList><ContentKey kid="0dc3ec4f-7683-548b-81e7-3c64e582e136"><Data><pskc:Secret><pskc:PlainValue>WADwG2qCqkq5TVml+U5PXw==</pskc:PlainValue></pskc:Secret></Data></ContentKey></ContentKeyList></CPIX>';

describe("selectable CPIX version validation", () => {
  it("exposes supported versions and the latest", () => {
    expect(SUPPORTED_CPIX_VERSIONS).toEqual(["2.2", "2.3", "2.3.1", "2.4"]);
    expect(LATEST_CPIX_VERSION).toBe("2.4");
  });

  it("commonEncryptionScheme validates on 2.3+ but not 2.2", () => {
    expect(validate(doc, { version: "2.2" })[0]).toBe(false);
    expect(validate(doc, { version: "2.3" })[0]).toBe(true);
    expect(validate(doc, { version: "2.3.1" })[0]).toBe(true);
    expect(validate(doc, { version: "2.4" })[0]).toBe(true);
  });

  it("a plain document validates across all supported versions", () => {
    for (const version of SUPPORTED_CPIX_VERSIONS) {
      expect(validate(plain, { version })[0]).toBe(true);
    }
  });
});

describe("version is driven by the document, end-to-end", () => {
  it("validate() with no version uses the document's own version attribute", () => {
    // Build and validate for 2.2 without ever naming a version at the call site.
    const doc22 = new CPIX({
      version: "2.2",
      contentKeys: new ContentKeyList(new ContentKey({ kid: KID, cek: CEK })),
    }).toString();
    expect(doc22).not.toContain("commonEncryptionScheme"); // 2.2-shaped
    expect(validate(doc22)[0]).toBe(true); // validate derives 2.2 from the doc

    const doc23 = new CPIX({
      version: "2.3",
      contentKeys: new ContentKeyList(new ContentKey({ kid: KID, cek: CEK })),
    }).toString();
    expect(doc23).toContain("commonEncryptionScheme"); // 2.3-shaped
    expect(validate(doc23)[0]).toBe(true);
  });

  it("an explicit toString({version}) can override the document's version", () => {
    const doc22 = new CPIX({
      contentKeys: new ContentKeyList(new ContentKey({ kid: KID, cek: CEK })),
    }).toString({ version: "2.2" });
    expect(doc22).not.toContain("commonEncryptionScheme");
    expect(validate(doc22, { version: "2.2" })[0]).toBe(true);
  });

  it("emits the right HLS multivariant-playlist token per version", () => {
    const withMaster = new CPIX({
      drmSystems: new DRMSystemList(
        new DRMSystem({
          kid: KID,
          systemId: "edef8ba9-79d6-4ace-a3c8-27dcd51d21ed",
          pssh: "QUFBQQ==",
          hlsSignalingData: "bWVkaWE=",
          hlsSignalingDataMaster: "bXY=",
        }),
      ),
    });
    // default (no version) → latest (2.4) → "multiVariant"; 2.3 → "master"
    expect(withMaster.toString()).toContain('playlist="multiVariant"');
    expect(withMaster.toString({ version: "2.3" })).toContain('playlist="master"');
    // each validates under its own version; the 2.4 token is rejected by 2.3
    expect(validate(withMaster.toString())[0]).toBe(true);
    expect(validate(withMaster.toString({ version: "2.3" }), { version: "2.3" })[0]).toBe(true);
    expect(validate(withMaster.toString({ version: "2.4" }), { version: "2.3" })[0]).toBe(false);
  });

  it("accepts a caller-supplied custom schema", () => {
    const permissive =
      '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" targetNamespace="urn:dashif:org:cpix" xmlns="urn:dashif:org:cpix"><xs:element name="CPIX"><xs:complexType><xs:sequence><xs:any minOccurs="0" maxOccurs="unbounded" processContents="skip"/></xs:sequence><xs:anyAttribute processContents="skip"/></xs:complexType></xs:element></xs:schema>';
    expect(validate(doc, { schema: permissive })[0]).toBe(true);
  });
});
