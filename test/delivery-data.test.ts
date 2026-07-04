import { describe, it, expect } from "vitest";
import { DeliveryKey, DocumentKey, MACMethod, DeliveryData, parse } from "../src/index.js";

const NS =
  'xmlns="urn:dashif:org:cpix" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:enc="http://www.w3.org/2001/04/xmlenc#"';

describe("delivery data", () => {
  it("delivery key dump", () => {
    expect(new DeliveryKey("bm90X2FfcmVhbF9jZXJ0Cg==").toString()).toBe(
      `<DeliveryKey ${NS}><ds:X509Data><ds:X509Certificate>bm90X2FfcmVhbF9jZXJ0Cg==</ds:X509Certificate></ds:X509Data></DeliveryKey>`,
    );
  });

  it("document key dump", () => {
    expect(new DocumentKey("bm90X2FfcmVhbF9jaXBoZXJfdmFsdWUK").toString()).toBe(
      `<DocumentKey ${NS} Algorithm="http://www.w3.org/2001/04/xmlenc#aes256-cbc"><Data><pskc:Secret><pskc:EncryptedValue><enc:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p"/><enc:CipherData><enc:CipherValue>bm90X2FfcmVhbF9jaXBoZXJfdmFsdWUK</enc:CipherValue></enc:CipherData></pskc:EncryptedValue></pskc:Secret></Data></DocumentKey>`,
    );
  });

  it("mac method dump", () => {
    expect(new MACMethod("YWxzb19ub3RfYV9yZWFsX2NpcGhlcl92YWx1ZQo=").toString()).toBe(
      `<MACMethod ${NS} Algorithm="http://www.w3.org/2001/04/xmldsig-more#hmac-sha512"><Key><enc:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p"/><enc:CipherData><enc:CipherValue>YWxzb19ub3RfYV9yZWFsX2NpcGhlcl92YWx1ZQo=</enc:CipherValue></enc:CipherData></Key></MACMethod>`,
    );
  });

  it("delivery data parse", () => {
    const xml =
      '<DeliveryData xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:enc="http://www.w3.org/2001/04/xmlenc#"><DeliveryKey><ds:X509Data><ds:X509Certificate>bm90X2FfcmVhbF9jZXJ0Cg==</ds:X509Certificate></ds:X509Data></DeliveryKey><DocumentKey Algorithm="http://www.w3.org/2001/04/xmlenc#aes256-cbc"><Data><pskc:Secret><pskc:EncryptedValue><enc:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p"/><enc:CipherData><enc:CipherValue>bm90X2FfcmVhbF9jaXBoZXJfdmFsdWUK</enc:CipherValue></enc:CipherData></pskc:EncryptedValue></pskc:Secret></Data></DocumentKey><MACMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#hmac-sha512"><Key><enc:EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p"/><enc:CipherData><enc:CipherValue>YWxzb19ub3RfYV9yZWFsX2NpcGhlcl92YWx1ZQo=</enc:CipherValue></enc:CipherData></Key></MACMethod></DeliveryData>';
    const dd = parse(xml) as DeliveryData;
    expect(dd.deliveryKey.certificate).toBe("bm90X2FfcmVhbF9jZXJ0Cg==");
    expect(dd.documentKey.cipherValue).toBe("bm90X2FfcmVhbF9jaXBoZXJfdmFsdWUK");
    expect(dd.macMethod?.cipherValue).toBe("YWxzb19ub3RfYV9yZWFsX2NpcGhlcl92YWx1ZQo=");
  });
});
