/** DeliveryData and related key classes (DeliveryKey, DocumentKey, MACMethod). */
import { Element, subElement } from "../xml.js";
import { ComparableBase, CpixList } from "../base.js";
import { b64decode } from "../base64.js";
import { ValueError } from "../errors.js";
import {
  NSMAP,
  DS,
  PSKC,
  ENC,
  CONTENT_KEY_WRAPPING_ALGORITHM,
  DOCUMENT_KEY_WRAPPING_ALGORITHM,
  ENCRYPTED_KEY_MAC_ALGORITHM,
} from "../constants.js";
import { ParsedNode, fromString } from "../dom.js";

function validateBase64(value: string, name: string): string {
  try {
    b64decode(value);
  } catch {
    throw new ValueError(`${name} is not a valid base64 string`);
  }
  return value;
}

function asNode(xml: string | ParsedNode): ParsedNode {
  return typeof xml === "string" ? fromString(xml) : xml;
}

export class DeliveryKey extends ComparableBase {
  private _certificate!: string;

  constructor(certificate: string) {
    super();
    this.certificate = certificate;
  }

  get certificate(): string {
    return this._certificate;
  }
  set certificate(certificate: string) {
    this._certificate = validateBase64(certificate, "certificate");
  }

  element(): Element {
    const dk = new Element("DeliveryKey", NSMAP);
    const data = subElement(dk, `{${DS}}X509Data`, NSMAP);
    const cert = subElement(data, `{${DS}}X509Certificate`, NSMAP);
    cert.text = this.certificate;
    return dk;
  }

  static parse(xml: string | ParsedNode): DeliveryKey {
    const node = asNode(xml);
    const cert = node.find(`.//{${DS}}X509Certificate`)!.text!;
    return new DeliveryKey(cert);
  }
}

export class DocumentKey extends ComparableBase {
  private _cipherValue!: string;

  constructor(cipherValue: string) {
    super();
    this.cipherValue = cipherValue;
  }

  get cipherValue(): string {
    return this._cipherValue;
  }
  set cipherValue(cipherValue: string) {
    this._cipherValue = validateBase64(cipherValue, "cipher_value");
  }

  element(): Element {
    const dk = new Element("DocumentKey", NSMAP);
    dk.set("Algorithm", CONTENT_KEY_WRAPPING_ALGORITHM);
    const data = subElement(dk, "Data", NSMAP);
    const secret = subElement(data, `{${PSKC}}Secret`, NSMAP);
    const ev = subElement(secret, `{${PSKC}}EncryptedValue`, NSMAP);
    const em = subElement(ev, `{${ENC}}EncryptionMethod`, NSMAP);
    em.set("Algorithm", DOCUMENT_KEY_WRAPPING_ALGORITHM);
    const cd = subElement(ev, `{${ENC}}CipherData`, NSMAP);
    const cv = subElement(cd, `{${ENC}}CipherValue`, NSMAP);
    cv.text = this.cipherValue;
    return dk;
  }

  static parse(xml: string | ParsedNode): DocumentKey {
    const node = asNode(xml);
    const cipherValue = node.find(`.//{${ENC}}CipherValue`)!.text!;
    return new DocumentKey(cipherValue);
  }
}

export class MACMethod extends ComparableBase {
  private _cipherValue!: string;

  constructor(cipherValue: string) {
    super();
    this.cipherValue = cipherValue;
  }

  get cipherValue(): string {
    return this._cipherValue;
  }
  set cipherValue(cipherValue: string) {
    this._cipherValue = validateBase64(cipherValue, "cipher_value");
  }

  element(): Element {
    const dk = new Element("MACMethod", NSMAP);
    dk.set("Algorithm", ENCRYPTED_KEY_MAC_ALGORITHM);
    const key = subElement(dk, "Key", NSMAP);
    const em = subElement(key, `{${ENC}}EncryptionMethod`, NSMAP);
    em.set("Algorithm", DOCUMENT_KEY_WRAPPING_ALGORITHM);
    const cd = subElement(key, `{${ENC}}CipherData`, NSMAP);
    const cv = subElement(cd, `{${ENC}}CipherValue`, NSMAP);
    cv.text = this.cipherValue;
    return dk;
  }

  static parse(xml: string | ParsedNode): MACMethod {
    const node = asNode(xml);
    const cipherValue = node.find(`.//{${ENC}}CipherValue`)!.text!;
    return new MACMethod(cipherValue);
  }
}

export class DeliveryData extends ComparableBase {
  private _deliveryKey!: DeliveryKey;
  private _documentKey!: DocumentKey;
  private _macMethod: MACMethod | null = null;

  constructor(deliveryKey: DeliveryKey, documentKey: DocumentKey, macMethod: MACMethod | null = null) {
    super();
    this.deliveryKey = deliveryKey;
    this.documentKey = documentKey;
    this.macMethod = macMethod;
  }

  get deliveryKey(): DeliveryKey {
    return this._deliveryKey;
  }
  set deliveryKey(value: DeliveryKey) {
    if (!(value instanceof DeliveryKey)) throw new TypeError("delivery_key should be a DeliveryKey");
    this._deliveryKey = value;
  }

  get documentKey(): DocumentKey {
    return this._documentKey;
  }
  set documentKey(value: DocumentKey) {
    if (!(value instanceof DocumentKey)) throw new TypeError("document_key should be a DocumentKey");
    this._documentKey = value;
  }

  get macMethod(): MACMethod | null {
    return this._macMethod;
  }
  set macMethod(value: MACMethod | null) {
    if (value === null) return;
    if (!(value instanceof MACMethod)) throw new TypeError("mac_method should be a MACMethod");
    this._macMethod = value;
  }

  element(): Element {
    const el = new Element("DeliveryData", NSMAP);
    el.append(this.deliveryKey.element());
    el.append(this.documentKey.element());
    if (this.macMethod !== null) el.append(this.macMethod.element());
    return el;
  }

  static parse(xml: string | ParsedNode): DeliveryData {
    const node = asNode(xml);
    let deliveryKey!: DeliveryKey;
    let documentKey!: DocumentKey;
    let macMethod: MACMethod | null = null;

    for (const element of node.getchildren()) {
      if (element.localName === "DeliveryKey") deliveryKey = DeliveryKey.parse(element);
      if (element.localName === "DocumentKey") documentKey = DocumentKey.parse(element);
      if (element.localName === "MACMethod") macMethod = MACMethod.parse(element);
    }

    return new DeliveryData(deliveryKey, documentKey, macMethod);
  }
}

export class DeliveryDataList extends CpixList<DeliveryData> {
  check(value: DeliveryData): void {
    if (!(value instanceof DeliveryData)) throw new TypeError(`${value} is not a DeliveryData`);
  }

  element(): Element {
    const el = new Element("DeliveryDataList", NSMAP);
    for (const deliveryData of this) el.append(deliveryData.element());
    return el;
  }

  static parse(xml: string | ParsedNode): DeliveryDataList {
    const node = asNode(xml);
    const list = new DeliveryDataList();
    for (const element of node.getchildren()) {
      if (element.localName === "DeliveryData") list.append(DeliveryData.parse(element));
    }
    return list;
  }
}
