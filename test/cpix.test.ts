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
  LabelFilter,
  KeyPeriodFilter,
  Period,
  PeriodList,
  Uuid,
  parse,
  validate,
} from "../src/index.js";

const PSSH =
  "AAAAxnBzc2gBAAAA7e+LqXnWSs6jyCfc1R0h7QAAAAINw+xPdoNUi4HnPGTlguE2FEe37S9mVyu9EwbOfPNhDQAAAIISEBRHt+0vZlcrvRMGznzzYQ0SEFrGoR6qL17Vv2aMQByBNMoSEG7hNRbI51h7rp9+zT6Zom4SEPnsEqYaJl1Hj4MzTjp40scSEA3D7E92g1SLgec8ZOWC4TYaDXdpZGV2aW5lX3Rlc3QiEXVuaWZpZWQtc3RyZWFtaW5nSOPclZsG";
const CPD =
  "PCEtLSBXaWRldmluZSAtLT4KPENvbnRlbnRQcm90ZWN0aW9uCiAgeG1sbnM9InVybjptcGVnOmRhc2g6c2NoZW1hOm1wZDoyMDExIgogIHhtbG5zOmNlbmM9InVybjptcGVnOmNlbmM6MjAxMyIKICBzY2hlbWVJZFVyaT0idXJuOnV1aWQ6RURFRjhCQTktNzlENi00QUNFLUEzQzgtMjdEQ0Q1MUQyMUVEIj4KICA8Y2VuYzpwc3NoPkFBQUF4bkJ6YzJnQkFBQUE3ZStMcVhuV1NzNmp5Q2ZjMVIwaDdRQUFBQUlOdyt4UGRvTlVpNEhuUEdUbGd1RTJGRWUzN1M5bVZ5dTlFd2JPZlBOaERRQUFBSUlTRUJSSHQrMHZabGNydlJNR3puenpZUTBTRUZyR29SNnFMMTdWdjJhTVFCeUJOTW9TRUc3aE5SYkk1MWg3cnA5K3pUNlpvbTRTRVBuc0VxWWFKbDFIajRNelRqcDQwc2NTRUEzRDdFOTJnMVNMZ2VjOFpPV0M0VFlhRFhkcFpHVjJhVzVsWDNSbGMzUWlFWFZ1YVdacFpXUXRjM1J5WldGdGFXNW5TT1BjbFpzRzwvY2VuYzpwc3NoPgo8L0NvbnRlbnRQcm90ZWN0aW9uPg==";
const HLS0 =
  "I0VYVC1YLUtFWTpNRVRIT0Q9U0FNUExFLUFFUyxLRVlJRD0weDBEQzNFQzRGNzY4MzU0OEI4MUU3M0M2NEU1ODJFMTM2LFVSST0iZGF0YTp0ZXh0L3BsYWluO2Jhc2U2NCxBQUFBb25CemMyZ0FBQUFBN2UrTHFYbldTczZqeUNmYzFSMGg3UUFBQUlJU0VCUkh0KzB2WmxjcnZSTUd6bnp6WVEwU0VGckdvUjZxTDE3VnYyYU1RQnlCTk1vU0VHN2hOUmJJNTFoN3JwOSt6VDZab200U0VQbnNFcVlhSmwxSGo0TXpUanA0MHNjU0VBM0Q3RTkyZzFTTGdlYzhaT1dDNFRZYURYZHBaR1YyYVc1bFgzUmxjM1FpRVhWdWFXWnBaV1F0YzNSeVpXRnRhVzVuU09QY2xac0ciLEtFWUZPUk1BVD0idXJuOnV1aWQ6ZWRlZjhiYTktNzlkNi00YWNlLWEzYzgtMjdkY2Q1MWQyMWVkIixLRVlGT1JNQVRWRVJTSU9OUz0iMSIK";
const HLS1 =
  "I0VYVC1YLUtFWTpNRVRIT0Q9U0FNUExFLUFFUyxLRVlJRD0weDE0NDdCN0VEMkY2NjU3MkJCRDEzMDZDRTdDRjM2MTBELFVSST0iZGF0YTp0ZXh0L3BsYWluO2Jhc2U2NCxBQUFBb25CemMyZ0FBQUFBN2UrTHFYbldTczZqeUNmYzFSMGg3UUFBQUlJU0VCUkh0KzB2WmxjcnZSTUd6bnp6WVEwU0VGckdvUjZxTDE3VnYyYU1RQnlCTk1vU0VHN2hOUmJJNTFoN3JwOSt6VDZab200U0VQbnNFcVlhSmwxSGo0TXpUanA0MHNjU0VBM0Q3RTkyZzFTTGdlYzhaT1dDNFRZYURYZHBaR1YyYVc1bFgzUmxjM1FpRVhWdWFXWnBaV1F0YzNSeVpXRnRhVzVuU09QY2xac0ciLEtFWUZPUk1BVD0idXJuOnV1aWQ6ZWRlZjhiYTktNzlkNi00YWNlLWEzYzgtMjdkY2Q1MWQyMWVkIixLRVlGT1JNQVRWRVJTSU9OUz0iMSIK";

const NS =
  'xmlns="urn:dashif:org:cpix" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:enc="http://www.w3.org/2001/04/xmlenc#"';

describe("usage rules", () => {
  it("simple usage rule", () => {
    const usageRule = new UsageRule({
      kid: "fdde4136-c15c-4953-bd45-ce0f454bd130",
      filters: [new VideoFilter(), new AudioFilter()],
    });
    expect(usageRule.length).toBe(2);
    expect(usageRule.toString()).toBe(
      '<ContentKeyUsageRule kid="fdde4136-c15c-4953-bd45-ce0f454bd130"><VideoFilter/><AudioFilter/></ContentKeyUsageRule>',
    );
  });

  it("two video filters", () => {
    const usageRule = new UsageRule({
      kid: "ceb5153d-9b2c-45a0-9c8c-2bfc5e8b0d2f",
      filters: [new VideoFilter({ hdr: true }), new VideoFilter({ hdr: false }), new AudioFilter()],
    });
    expect(usageRule.length).toBe(3);
    expect(usageRule.toString()).toBe(
      '<ContentKeyUsageRule kid="ceb5153d-9b2c-45a0-9c8c-2bfc5e8b0d2f"><VideoFilter hdr="true"/><VideoFilter hdr="false"/><AudioFilter/></ContentKeyUsageRule>',
    );
  });

  it("label filter", () => {
    const usageRule = new UsageRule({
      kid: "37690647-d729-43f5-9e92-8c06f6e6c5b0",
      filters: [new LabelFilter("test_label_1")],
    });
    expect(usageRule.length).toBe(1);
    expect((usageRule[0] as LabelFilter).label).toBe("test_label_1");
    expect(usageRule.toString()).toBe(
      '<ContentKeyUsageRule kid="37690647-d729-43f5-9e92-8c06f6e6c5b0"><LabelFilter label="test_label_1"/></ContentKeyUsageRule>',
    );
  });

  it("intended track type", () => {
    const usageRule = new UsageRule({
      kid: "fdde4136-c15c-4953-bd45-ce0f454bd130",
      filters: [new VideoFilter(), new AudioFilter()],
      intendedTrackType: "VIDEO_AUDIO",
    });
    expect(usageRule.length).toBe(2);
    expect(usageRule.toString()).toBe(
      '<ContentKeyUsageRule kid="fdde4136-c15c-4953-bd45-ce0f454bd130" intendedTrackType="VIDEO_AUDIO"><VideoFilter/><AudioFilter/></ContentKeyUsageRule>',
    );
  });
});

describe("filters (parse)", () => {
  it("parse label filter", () => {
    const lf = parse('<LabelFilter label="test_label_1"/>') as LabelFilter;
    expect(lf.label).toBe("test_label_1");
  });

  it("dump bool round-trips", () => {
    const xml = '<VideoFilter hdr="true" wcg="false"/>';
    const vf = parse(xml) as VideoFilter;
    expect(vf.toString()).toBe(xml);
  });

  it("parse bool values", () => {
    const vf = parse('<VideoFilter hdr="true" wcg="false"/>') as VideoFilter;
    expect(vf.wcg).toBe(false);
    expect(vf.hdr).toBe(true);
  });

  it("invalid bool throws", () => {
    expect(() => parse('<VideoFilter hdr="bar" wcg="foo"/>')).toThrow();
  });

  it("compare simple audio and video filters", () => {
    const af = new AudioFilter();
    const vf = new VideoFilter();
    expect(af.toString() < vf.toString()).toBe(true);
    expect(vf.toString() > af.toString()).toBe(true);
    expect(af.equals(vf)).toBe(false);

    const vf2 = new VideoFilter({ minPixels: 1 });
    expect(vf.toString() > vf2.toString()).toBe(true);
    expect(vf.equals(vf2)).toBe(false);
  });

  it("audio filter equality", () => {
    const af = new AudioFilter(2);
    const af2 = new AudioFilter(1);
    expect(af.equals(af2)).toBe(false);
    expect(af.equals(new AudioFilter(2))).toBe(true);
  });
});

describe("content keys", () => {
  it("kid as string", () => {
    const ck = new ContentKey({ kid: "0DC3EC4F-7683-548B-81E7-3C64E582E136", cek: "WADwG2qCqkq5TVml+U5PXw==" });
    expect(ck.kid.equals(new Uuid("0DC3EC4F-7683-548B-81E7-3C64E582E136"))).toBe(true);
    expect(ck.cek).toBe("WADwG2qCqkq5TVml+U5PXw==");
    expect(ck.toString()).toBe(
      `<ContentKey ${NS} kid="0dc3ec4f-7683-548b-81e7-3c64e582e136" commonEncryptionScheme="cenc"><Data><pskc:Secret><pskc:PlainValue>WADwG2qCqkq5TVml+U5PXw==</pskc:PlainValue></pskc:Secret></Data></ContentKey>`,
    );
  });

  it("kid as Uuid", () => {
    const ck = new ContentKey({ kid: new Uuid("0DC3EC4F-7683-548B-81E7-3C64E582E136"), cek: "WADwG2qCqkq5TVml+U5PXw==" });
    expect(ck.toString()).toContain('kid="0dc3ec4f-7683-548b-81e7-3c64e582e136"');
  });

  it("no cek", () => {
    const ck = new ContentKey({ kid: new Uuid("0DC3EC4F-7683-548B-81E7-3C64E582E136") });
    expect(ck.cek).toBeNull();
    expect(ck.toString()).toBe(
      `<ContentKey ${NS} kid="0dc3ec4f-7683-548b-81e7-3c64e582e136" commonEncryptionScheme="cenc"/>`,
    );
  });

  it("parse content key with no cek", () => {
    const ck = new ContentKey({ kid: new Uuid("0DC3EC4F-7683-548B-81E7-3C64E582E136") });
    const result = parse(ck.toString()) as ContentKey;
    expect(result.kid.equals(ck.kid)).toBe(true);
    expect(result.cek).toBeNull();
  });

  it("encrypted content key parse", () => {
    const ck = parse(
      '<ContentKey xmlns="urn:dashif:org:cpix" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc" xmlns:enc="http://www.w3.org/2001/04/xmlenc#" kid="0e09da81-2883-4bbf-90db-26986cec85d4"><Data><pskc:Secret><pskc:EncryptedValue><enc:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes256-cbc"/><enc:CipherData><enc:CipherValue>8DRcwDXG/Jh4aLrfgqFV20ji2HEgwsduHP87SpdqgrSGhfY1gWXJK+uBjNAuabwV</enc:CipherValue></enc:CipherData></pskc:EncryptedValue><pskc:ValueMAC>nlWgLwxW3bR4ljRuHwqOLqEQ3OP3mUIVARTJd0Prf8iFjT7Aq+5sBgletyeptTGU+PmwtkZgqTflFaUrw7vn9g==</pskc:ValueMAC></pskc:Secret></Data></ContentKey>',
    ) as ContentKey;
    expect(ck.valueMac).toBe(
      "nlWgLwxW3bR4ljRuHwqOLqEQ3OP3mUIVARTJd0Prf8iFjT7Aq+5sBgletyeptTGU+PmwtkZgqTflFaUrw7vn9g==",
    );
    expect(ck.cek).toBe("8DRcwDXG/Jh4aLrfgqFV20ji2HEgwsduHP87SpdqgrSGhfY1gWXJK+uBjNAuabwV");
  });

  it("encrypted content key dump", () => {
    const eck = new ContentKey({
      kid: "b4c3188b-eddd-453d-9bc2-1cbca7566239",
      cek: "SOixulPBawh7EL+wQFSWuFvsqMXOYVJrerpUXwHaN5KEPhy8hv2/H6f8OXUykLxW",
      valueMac: "sFdbSq+8o773SoBnGFVwMa4SMvRpFgDo2uAhRMquRoVtFyOIoKVcsJAjMDiOyoY7ztZZPjSjqlzqkF86CNtCjg==",
    });
    expect(eck.toString()).toBe(
      `<ContentKey ${NS} kid="b4c3188b-eddd-453d-9bc2-1cbca7566239" commonEncryptionScheme="cenc"><Data><pskc:Secret><pskc:EncryptedValue><enc:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes256-cbc"/><enc:CipherData><enc:CipherValue>SOixulPBawh7EL+wQFSWuFvsqMXOYVJrerpUXwHaN5KEPhy8hv2/H6f8OXUykLxW</enc:CipherValue></enc:CipherData></pskc:EncryptedValue><pskc:ValueMAC>sFdbSq+8o773SoBnGFVwMa4SMvRpFgDo2uAhRMquRoVtFyOIoKVcsJAjMDiOyoY7ztZZPjSjqlzqkF86CNtCjg==</pskc:ValueMAC></pskc:Secret></Data></ContentKey>`,
    );
  });

  it("encrypted to plain content key", () => {
    const ck = parse(
      '<ContentKey xmlns="urn:dashif:org:cpix" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc" xmlns:enc="http://www.w3.org/2001/04/xmlenc#" kid="0e09da81-2883-4bbf-90db-26986cec85d4"><Data><pskc:Secret><pskc:EncryptedValue><enc:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes256-cbc"/><enc:CipherData><enc:CipherValue>8DRcwDXG/Jh4aLrfgqFV20ji2HEgwsduHP87SpdqgrSGhfY1gWXJK+uBjNAuabwV</enc:CipherValue></enc:CipherData></pskc:EncryptedValue><pskc:ValueMAC>nlWgLwxW3bR4ljRuHwqOLqEQ3OP3mUIVARTJd0Prf8iFjT7Aq+5sBgletyeptTGU+PmwtkZgqTflFaUrw7vn9g==</pskc:ValueMAC></pskc:Secret></Data></ContentKey>',
    ) as ContentKey;
    ck.cek = "WADwG2qCqkq5TVml+U5PXw==";
    ck.valueMac = null;
    expect(ck.toString()).toBe(
      `<ContentKey ${NS} kid="0e09da81-2883-4bbf-90db-26986cec85d4" commonEncryptionScheme="cenc"><Data><pskc:Secret><pskc:PlainValue>WADwG2qCqkq5TVml+U5PXw==</pskc:PlainValue></pskc:Secret></Data></ContentKey>`,
    );
  });

  it("list, append, delete, iterate", () => {
    const list = new ContentKeyList(
      new ContentKey({ kid: "0DC3EC4F-7683-548B-81E7-3C64E582E136", cek: "WADwG2qCqkq5TVml+U5PXw==" }),
      new ContentKey({ kid: "1447B7ED-2F66-572B-BD13-06CE7CF3610D", cek: "ydugVLA+K017XoGM4mjxvA==" }),
    );
    expect(list.length).toBe(2);
    expect(list.toString()).toBe(
      `<ContentKeyList ${NS}><ContentKey kid="0dc3ec4f-7683-548b-81e7-3c64e582e136" commonEncryptionScheme="cenc"><Data><pskc:Secret><pskc:PlainValue>WADwG2qCqkq5TVml+U5PXw==</pskc:PlainValue></pskc:Secret></Data></ContentKey><ContentKey kid="1447b7ed-2f66-572b-bd13-06ce7cf3610d" commonEncryptionScheme="cenc"><Data><pskc:Secret><pskc:PlainValue>ydugVLA+K017XoGM4mjxvA==</pskc:PlainValue></pskc:Secret></Data></ContentKey></ContentKeyList>`,
    );

    list.splice(1, 1);
    expect(list.length).toBe(1);
    for (const ck of list) expect(ck).toBeInstanceOf(ContentKey);
  });
});

describe("CPIX documents", () => {
  it("empty cpix", () => {
    const empty = new CPIX();
    expect(empty.contentKeys.length).toBe(0);
    expect(empty.version).toBeNull();
    expect(empty.toString()).toBe(
      `<CPIX ${NS} xsi:schemaLocation="urn:dashif:org:cpix cpix.xsd"/>`,
    );
  });

  it("full widevine cpix", () => {
    const full = new CPIX({
      contentKeys: new ContentKeyList(
        new ContentKey({ kid: "0DC3EC4F-7683-548B-81E7-3C64E582E136", cek: "WADwG2qCqkq5TVml+U5PXw==" }),
        new ContentKey({ kid: "1447B7ED-2F66-572B-BD13-06CE7CF3610D", cek: "ydugVLA+K017XoGM4mjxvA==" }),
        new ContentKey({ kid: "00000000-0000-0000-0000-000000000002", cek: "AAAAAAAAAAAAAAAAAAAAAg==" }),
      ),
      drmSystems: new DRMSystemList(
        new DRMSystem({ kid: "0DC3EC4F-7683-548B-81E7-3C64E582E136", systemId: "EDEF8BA9-79D6-4ACE-A3C8-27DCD51D21ED", pssh: PSSH, contentProtectionData: CPD, hlsSignalingData: HLS0 }),
        new DRMSystem({ kid: "1447B7ED-2F66-572B-BD13-06CE7CF3610D", systemId: "EDEF8BA9-79D6-4ACE-A3C8-27DCD51D21ED", pssh: PSSH, contentProtectionData: CPD, hlsSignalingData: HLS1 }),
        new DRMSystem({ kid: "00000000-0000-0000-0000-000000000002", systemId: "EDEF8BA9-79D6-4ACE-A3C8-27DCD51D21ED", pssh: PSSH, contentProtectionData: "", hlsSignalingData: HLS1 }),
      ),
      usageRules: new UsageRuleList(
        new UsageRule({ kid: "0DC3EC4F-7683-548B-81E7-3C64E582E136", filters: [new AudioFilter()] }),
        new UsageRule({ kid: "1447B7ED-2F66-572B-BD13-06CE7CF3610D", filters: [new VideoFilter({ maxPixels: 38912 })] }),
        new UsageRule({ kid: "00000000-0000-0000-0000-000000000002", filters: [new VideoFilter({ minPixels: 38913 })] }),
      ),
      version: "2.3",
    });

    expect(full.validateContent()[0]).toBe(true);
    expect(full.toString()).toBe(
      `<CPIX ${NS} xsi:schemaLocation="urn:dashif:org:cpix cpix.xsd" version="2.3"><ContentKeyList><ContentKey kid="0dc3ec4f-7683-548b-81e7-3c64e582e136" commonEncryptionScheme="cenc"><Data><pskc:Secret><pskc:PlainValue>WADwG2qCqkq5TVml+U5PXw==</pskc:PlainValue></pskc:Secret></Data></ContentKey><ContentKey kid="1447b7ed-2f66-572b-bd13-06ce7cf3610d" commonEncryptionScheme="cenc"><Data><pskc:Secret><pskc:PlainValue>ydugVLA+K017XoGM4mjxvA==</pskc:PlainValue></pskc:Secret></Data></ContentKey><ContentKey kid="00000000-0000-0000-0000-000000000002" commonEncryptionScheme="cenc"><Data><pskc:Secret><pskc:PlainValue>AAAAAAAAAAAAAAAAAAAAAg==</pskc:PlainValue></pskc:Secret></Data></ContentKey></ContentKeyList><DRMSystemList><DRMSystem kid="0dc3ec4f-7683-548b-81e7-3c64e582e136" systemId="edef8ba9-79d6-4ace-a3c8-27dcd51d21ed"><PSSH>${PSSH}</PSSH><ContentProtectionData>${CPD}</ContentProtectionData><HLSSignalingData playlist="media">${HLS0}</HLSSignalingData></DRMSystem><DRMSystem kid="1447b7ed-2f66-572b-bd13-06ce7cf3610d" systemId="edef8ba9-79d6-4ace-a3c8-27dcd51d21ed"><PSSH>${PSSH}</PSSH><ContentProtectionData>${CPD}</ContentProtectionData><HLSSignalingData playlist="media">${HLS1}</HLSSignalingData></DRMSystem><DRMSystem kid="00000000-0000-0000-0000-000000000002" systemId="edef8ba9-79d6-4ace-a3c8-27dcd51d21ed"><PSSH>${PSSH}</PSSH><ContentProtectionData></ContentProtectionData><HLSSignalingData playlist="media">${HLS1}</HLSSignalingData></DRMSystem></DRMSystemList><ContentKeyUsageRuleList><ContentKeyUsageRule kid="0dc3ec4f-7683-548b-81e7-3c64e582e136"><AudioFilter/></ContentKeyUsageRule><ContentKeyUsageRule kid="1447b7ed-2f66-572b-bd13-06ce7cf3610d"><VideoFilter maxPixels="38912"/></ContentKeyUsageRule><ContentKeyUsageRule kid="00000000-0000-0000-0000-000000000002"><VideoFilter minPixels="38913"/></ContentKeyUsageRule></ContentKeyUsageRuleList></CPIX>`,
    );
  });

  it("parse single content key cpix", () => {
    const xml =
      '<CPIX xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:enc="http://www.w3.org/2001/04/xmlenc#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:dashif:org:cpix" xsi:schemaLocation="urn:dashif:org:cpix cpix.xsd"><ContentKeyList><ContentKey kid="0dc3ec4f-7683-548b-81e7-3c64e582e136"><Data><pskc:Secret><pskc:PlainValue>WADwG2qCqkq5TVml+U5PXw==</pskc:PlainValue></pskc:Secret></Data></ContentKey></ContentKeyList></CPIX>';
    const cpix = CPIX.parse(xml);
    expect(cpix.contentKeys.length).toBe(1);
    expect(cpix.contentKeys[0].kid.equals(new Uuid("0dc3ec4f-7683-548b-81e7-3c64e582e136"))).toBe(true);
    expect(cpix.contentKeys[0].cek).toBe("WADwG2qCqkq5TVml+U5PXw==");
    expect(cpix.toString()).toBe(
      `<CPIX ${NS} xsi:schemaLocation="urn:dashif:org:cpix cpix.xsd"><ContentKeyList><ContentKey kid="0dc3ec4f-7683-548b-81e7-3c64e582e136" commonEncryptionScheme="cenc"><Data><pskc:Secret><pskc:PlainValue>WADwG2qCqkq5TVml+U5PXw==</pskc:PlainValue></pskc:Secret></Data></ContentKey></ContentKeyList></CPIX>`,
    );
  });

  it("parse complex cpix and compare usage rule", () => {
    const xml = new CPIX({
      contentKeys: new ContentKeyList(
        new ContentKey({ kid: "0DC3EC4F-7683-548B-81E7-3C64E582E136", cek: "WADwG2qCqkq5TVml+U5PXw==" }),
        new ContentKey({ kid: "1447B7ED-2F66-572B-BD13-06CE7CF3610D", cek: "ydugVLA+K017XoGM4mjxvA==" }),
        new ContentKey({ kid: "00000000-0000-0000-0000-000000000002", cek: "AAAAAAAAAAAAAAAAAAAAAg==" }),
      ),
      usageRules: new UsageRuleList(
        new UsageRule({ kid: "0DC3EC4F-7683-548B-81E7-3C64E582E136", filters: [new AudioFilter()] }),
        new UsageRule({ kid: "1447B7ED-2F66-572B-BD13-06CE7CF3610D", filters: [new VideoFilter({ maxPixels: 38912 })] }),
        new UsageRule({ kid: "00000000-0000-0000-0000-000000000002", filters: [new VideoFilter({ minPixels: 38913 })] }),
      ),
    }).toString();

    const complex = CPIX.parse(xml);
    expect(complex.contentKeys.length).toBe(3);
    expect(complex.usageRules.length).toBe(3);
    expect(
      complex.usageRules[0].equals(new UsageRule({ kid: "0DC3EC4F-7683-548B-81E7-3C64E582E136", filters: [new AudioFilter()] })),
    ).toBe(true);
  });

  it("content id (construct + parse)", () => {
    expect(new CPIX({ contentId: "test123" }).contentId).toBe("test123");
    expect((parse('<CPIX contentId="mycontentId"/>') as CPIX).contentId).toBe("mycontentId");
  });
});

describe("periods", () => {
  it("period with index", () => {
    expect(new Period({ id: "test", index: 0 }).toString()).toBe(
      `<ContentKeyPeriod ${NS} id="test" index="0"/>`,
    );
  });

  it("period with dates", () => {
    expect(new Period({ id: "test", start: "2018-08-06T00:00:00Z", end: "2018-08-07T00:00:00Z" }).toString()).toBe(
      `<ContentKeyPeriod ${NS} id="test" start="2018-08-06T00:00:00Z" end="2018-08-07T00:00:00Z"/>`,
    );
  });

  it("valid cpix with period", () => {
    const doc = new CPIX({
      periods: new PeriodList(new Period({ id: "test", start: "2018-08-06T00:00:00Z", end: "2018-08-07T00:00:00Z" })),
    });
    const xml = doc.toString();
    expect(xml).toBe(
      `<CPIX ${NS} xsi:schemaLocation="urn:dashif:org:cpix cpix.xsd"><ContentKeyPeriodList><ContentKeyPeriod id="test" start="2018-08-06T00:00:00Z" end="2018-08-07T00:00:00Z"/></ContentKeyPeriodList></CPIX>`,
    );
    expect(validate(xml)[0]).toBe(true);
  });

  it("period filter", () => {
    expect(new KeyPeriodFilter("test").toString()).toBe('<KeyPeriodFilter periodId="test"/>');
  });

  it("parse period", () => {
    const doc = parse(
      '<CPIX xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:enc="http://www.w3.org/2001/04/xmlenc#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:dashif:org:cpix" xsi:schemaLocation="urn:dashif:org:cpix cpix.xsd"><ContentKeyPeriodList><ContentKeyPeriod id="test" start="2018-08-06T00:00:00Z" end="2018-08-07T00:00:00Z"/></ContentKeyPeriodList></CPIX>',
    ) as CPIX;
    expect(doc.periods.length).toBe(1);
    expect(doc.periods[0].id).toBe("test");
    expect(doc.periods[0].index).toBeNull();
    expect(doc.periods[0].start?.getTime()).toBe(new Date("2018-08-06T00:00:00Z").getTime());
    expect(doc.periods[0].end?.getTime()).toBe(new Date("2018-08-07T00:00:00Z").getTime());
  });

  it("parse period with index", () => {
    const doc = parse(
      '<CPIX xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:dashif:org:cpix" xsi:schemaLocation="urn:dashif:org:cpix cpix.xsd"><ContentKeyPeriodList><ContentKeyPeriod xmlns="urn:dashif:org:cpix" id="test" index="0"/></ContentKeyPeriodList></CPIX>',
    ) as CPIX;
    expect(doc.periods.length).toBe(1);
    expect(doc.periods[0].id).toBe("test");
    expect(doc.periods[0].index).toBe(0);
    expect(doc.periods[0].start).toBeNull();
    expect(doc.periods[0].end).toBeNull();
  });
});

describe("XSD validation", () => {
  // Raw schema-valid document (note: the bundled XSD does not allow the
  // commonEncryptionScheme attribute that element() emits, so validation is
  // exercised against hand-written documents).
  const valid =
    '<CPIX xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:enc="http://www.w3.org/2001/04/xmlenc#" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:dashif:org:cpix" xsi:schemaLocation="urn:dashif:org:cpix cpix.xsd"><ContentKeyList><ContentKey kid="0dc3ec4f-7683-548b-81e7-3c64e582e136"><Data><pskc:Secret><pskc:PlainValue>WADwG2qCqkq5TVml+U5PXw==</pskc:PlainValue></pskc:Secret></Data></ContentKey></ContentKeyList><ContentKeyUsageRuleList><ContentKeyUsageRule kid="0dc3ec4f-7683-548b-81e7-3c64e582e136"><AudioFilter/></ContentKeyUsageRule></ContentKeyUsageRuleList></CPIX>';

  it("valid document", () => {
    expect(validate(valid)[0]).toBe(true);
  });

  it("invalid document (misspelled attribute rejected)", () => {
    const bad = valid.replace("<AudioFilter/>", '<VideoFilter mixPixels="1"/>');
    expect(validate(bad)[0]).toBe(false);
  });
});
