/** ContentKey and ContentKeyList classes. */
import { Element, subElement } from "../xml.js";
import { ComparableBase, CpixList } from "../base.js";
import { atLeastVersion, LATEST_CPIX_VERSION, type CpixVersion } from "../version.js";
import { Uuid, toUuid } from "../uuid.js";
import { b64decode } from "../base64.js";
import { ValueError } from "../errors.js";
import { NSMAP, PSKC, ENC, CONTENT_KEY_WRAPPING_ALGORITHM } from "../constants.js";
import { ParsedNode, fromString } from "../dom.js";

const SCHEMES = ["cenc", "cbc1", "cens", "cbcs"];

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

export interface ContentKeyOptions {
  kid: string | Uuid;
  cek?: string | null;
  commonEncryptionScheme?: string | null;
  explicitIv?: string | null;
  valueMac?: string | null;
}

export class ContentKey extends ComparableBase {
  private _kid!: Uuid;
  private _cek: string | null = null;
  private _commonEncryptionScheme: string | null = null;
  private _explicitIv: string | null = null;
  private _valueMac: string | null = null;

  constructor(opts: ContentKeyOptions) {
    super();
    this.kid = opts.kid;
    this.cek = opts.cek ?? null;
    this.commonEncryptionScheme = opts.commonEncryptionScheme ?? null;
    this.explicitIv = opts.explicitIv ?? null;
    this.valueMac = opts.valueMac ?? null;
  }

  get kid(): Uuid {
    return this._kid;
  }
  set kid(kid: string | Uuid) {
    this._kid = toUuid(kid);
  }

  get cek(): string | null {
    return this._cek;
  }
  set cek(cek: string | null) {
    if (cek === null) return;
    this._cek = validateBase64(cek, "cek");
  }

  get commonEncryptionScheme(): string | null {
    return this._commonEncryptionScheme;
  }
  set commonEncryptionScheme(scheme: string | null) {
    const value = scheme ?? "cenc";
    if (SCHEMES.includes(value)) {
      this._commonEncryptionScheme = value;
    } else {
      throw new TypeError("common_encryption_scheme must be: cenc, cbc1, cens or cbcs");
    }
  }

  get explicitIv(): string | null {
    return this._explicitIv;
  }
  set explicitIv(iv: string | null) {
    if (iv === null) return;
    this._explicitIv = validateBase64(iv, "explicit_iv");
  }

  get valueMac(): string | null {
    return this._valueMac;
  }
  set valueMac(mac: string | null) {
    if (mac !== null) {
      this._valueMac = validateBase64(mac, "value_mac");
    } else {
      this._valueMac = null;
    }
  }

  element(version: CpixVersion = LATEST_CPIX_VERSION): Element {
    const el = new Element("ContentKey", NSMAP);
    el.set("kid", String(this.kid));
    // commonEncryptionScheme was introduced in CPIX 2.3.
    if (this.commonEncryptionScheme && atLeastVersion(version, "2.3"))
      el.set("commonEncryptionScheme", this.commonEncryptionScheme);
    if (this.explicitIv) el.set("explicitIV", this.explicitIv);
    if (this.cek) {
      const data = subElement(el, "Data", NSMAP);
      const secret = subElement(data, `{${PSKC}}Secret`, NSMAP);
      // Presence of a MAC signals the keys are encrypted (per the CPIX spec,
      // MAC is mandatory for encrypted keys and used for cryptographic
      // protection rather than general authentication).
      if (this.valueMac !== null) {
        const ev = subElement(secret, `{${PSKC}}EncryptedValue`, NSMAP);
        const em = subElement(ev, `{${ENC}}EncryptionMethod`, NSMAP);
        em.set("Algorithm", CONTENT_KEY_WRAPPING_ALGORITHM);
        const cd = subElement(ev, `{${ENC}}CipherData`, NSMAP);
        const cv = subElement(cd, `{${ENC}}CipherValue`, NSMAP);
        cv.text = this.cek;
        const vm = subElement(secret, `{${PSKC}}ValueMAC`, NSMAP);
        vm.text = this.valueMac;
      } else {
        const plainValue = subElement(secret, `{${PSKC}}PlainValue`, NSMAP);
        plainValue.text = this.cek;
      }
    }
    return el;
  }

  static parse(xml: string | ParsedNode): ContentKey {
    const node = asNode(xml);
    const kid = node.attrib["kid"];

    let cek: string | null = null;
    let valueMac: string | null = null;

    if (node.find(`**/{${PSKC}}EncryptedValue`) !== null) {
      cek = node.find(`.//{${ENC}}CipherValue`)?.text ?? null;
      valueMac = node.find(`.//{${PSKC}}ValueMAC`)?.text ?? null;
    } else {
      cek = node.find(`**/{${PSKC}}PlainValue`)?.text ?? null;
    }

    return new ContentKey({
      kid,
      cek,
      commonEncryptionScheme: "commonEncryptionScheme" in node.attrib ? node.attrib["commonEncryptionScheme"] : null,
      explicitIv: "explicitIV" in node.attrib ? node.attrib["explicitIV"] : null,
      valueMac,
    });
  }
}

export class ContentKeyList extends CpixList<ContentKey> {
  check(value: ContentKey): void {
    if (!(value instanceof ContentKey)) throw new TypeError(`${value} is not a ContentKey`);
  }

  element(version: CpixVersion = LATEST_CPIX_VERSION): Element {
    const el = new Element("ContentKeyList", NSMAP);
    for (const contentKey of this) el.append(contentKey.element(version));
    return el;
  }

  static parse(xml: string | ParsedNode): ContentKeyList {
    const node = asNode(xml);
    const list = new ContentKeyList();
    for (const element of node.getchildren()) {
      if (element.localName === "ContentKey") list.append(ContentKey.parse(element));
    }
    return list;
  }
}
