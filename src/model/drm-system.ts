/** DRMSystem and DRMSystemList classes. */
import { Element } from "../xml.js";
import { ComparableBase, CpixList } from "../base.js";
import { atLeastVersion, LATEST_CPIX_VERSION, type CpixVersion } from "../version.js";
import { Uuid, toUuid } from "../uuid.js";
import { b64decode } from "../base64.js";
import { ValueError } from "../errors.js";
import { VALID_SYSTEM_IDS } from "../constants.js";
import { ParsedNode, fromString } from "../dom.js";

function validateBase64(value: string, name: string): string {
  try {
    b64decode(value);
  } catch {
    throw new ValueError(`${name} is not a valid base64 string`);
  }
  return value;
}

function requireBase64String(value: unknown, name: string, message: string): string {
  if (typeof value !== "string") throw new TypeError(message);
  return validateBase64(value, name);
}

function asNode(xml: string | ParsedNode): ParsedNode {
  return typeof xml === "string" ? fromString(xml) : xml;
}

export interface DRMSystemOptions {
  kid: string | Uuid;
  systemId: string | Uuid;
  pssh?: string | null;
  contentProtectionData?: string | null;
  hlsSignalingData?: string | null;
  hlsSignalingDataMaster?: string | null;
  smoothStreamingProtectionHeaderData?: string | null;
}

export class DRMSystem extends ComparableBase {
  private _kid!: Uuid;
  private _systemId!: Uuid;
  private _pssh: string | null = null;
  private _contentProtectionData: string | null = null;
  private _hlsSignalingData: string | null = null;
  private _hlsSignalingDataMaster: string | null = null;
  private _smoothStreamingProtectionHeaderData: string | null = null;

  constructor(opts: DRMSystemOptions) {
    super();
    this.kid = opts.kid;
    this.systemId = opts.systemId;
    if (opts.pssh != null) this.pssh = opts.pssh;
    if (opts.contentProtectionData != null) this.contentProtectionData = opts.contentProtectionData;
    if (opts.hlsSignalingData != null) this.hlsSignalingData = opts.hlsSignalingData;
    if (opts.hlsSignalingDataMaster != null) this.hlsSignalingDataMaster = opts.hlsSignalingDataMaster;
    if (opts.smoothStreamingProtectionHeaderData != null)
      this.smoothStreamingProtectionHeaderData = opts.smoothStreamingProtectionHeaderData;
  }

  get kid(): Uuid {
    return this._kid;
  }
  set kid(kid: string | Uuid) {
    this._kid = toUuid(kid);
  }

  get systemId(): Uuid {
    return this._systemId;
  }
  set systemId(systemId: string | Uuid) {
    const tmp = toUuid(systemId);
    if (VALID_SYSTEM_IDS.some((id) => id.equals(tmp))) {
      this._systemId = tmp;
    } else {
      throw new ValueError("system_id is unknown");
    }
  }

  get pssh(): string | null {
    return this._pssh;
  }
  set pssh(pssh: string) {
    this._pssh = requireBase64String(pssh, "pssh", "pssh should be a base64 string");
  }

  get contentProtectionData(): string | null {
    return this._contentProtectionData;
  }
  set contentProtectionData(value: string) {
    this._contentProtectionData = requireBase64String(
      value,
      "content_protection_data",
      "content_protection_data must be a base64 string",
    );
  }

  get hlsSignalingData(): string | null {
    return this._hlsSignalingData;
  }
  set hlsSignalingData(value: string) {
    this._hlsSignalingData = requireBase64String(value, "hls_signaling_data", "hls_signaling_data should be a base64 string");
  }

  get hlsSignalingDataMaster(): string | null {
    return this._hlsSignalingDataMaster;
  }
  set hlsSignalingDataMaster(value: string) {
    this._hlsSignalingDataMaster = requireBase64String(
      value,
      "hls_signaling_data_master",
      "hls_signaling_data_master should be a base64 string",
    );
  }

  /** SmoothStreamingProtectionHeaderData (an `xs:string`, not base64). */
  get smoothStreamingProtectionHeaderData(): string | null {
    return this._smoothStreamingProtectionHeaderData;
  }
  set smoothStreamingProtectionHeaderData(value: string) {
    if (typeof value !== "string")
      throw new TypeError("smooth_streaming_protection_header_data should be a string");
    this._smoothStreamingProtectionHeaderData = value;
  }

  element(version: CpixVersion = LATEST_CPIX_VERSION): Element {
    const el = new Element("DRMSystem");
    if (this.kid != null) el.set("kid", String(this.kid));
    if (this.systemId != null) el.set("systemId", String(this.systemId));
    if (this.pssh !== null) {
      const psshEl = new Element("PSSH");
      psshEl.text = this.pssh;
      el.append(psshEl);
    }
    if (this.contentProtectionData !== null) {
      const cpd = new Element("ContentProtectionData");
      cpd.text = this.contentProtectionData;
      el.append(cpd);
    }
    if (this.hlsSignalingData !== null) {
      const hls = new Element("HLSSignalingData");
      hls.set("playlist", "media");
      hls.text = this.hlsSignalingData;
      el.append(hls);
    }
    if (this.hlsSignalingDataMaster !== null) {
      const hls = new Element("HLSSignalingData");
      // CPIX 2.4 renamed the master-playlist value from "master" to "multiVariant".
      hls.set("playlist", atLeastVersion(version, "2.4") ? "multiVariant" : "master");
      hls.text = this.hlsSignalingDataMaster;
      el.append(hls);
    }
    if (this.smoothStreamingProtectionHeaderData !== null) {
      const ssphd = new Element("SmoothStreamingProtectionHeaderData");
      ssphd.text = this.smoothStreamingProtectionHeaderData;
      el.append(ssphd);
    }
    return el;
  }

  static parse(xml: string | ParsedNode): DRMSystem {
    const node = asNode(xml);
    const kid = node.attrib["kid"];
    const systemId = node.attrib["systemId"];

    let pssh: string | null = null;
    let contentProtectionData: string | null = null;
    let hlsSignalingData: string | null = null;
    let hlsSignalingDataMaster: string | null = null;

    if (node.find("{*}PSSH") !== null) pssh = node.find("{*}PSSH")!.text;
    if (node.find("{*}ContentProtectionData") !== null)
      contentProtectionData = node.find("{*}ContentProtectionData")!.text;
    for (const element of node.findall("{*}HLSSignalingData")) {
      const playlist = element.attrib["playlist"];
      if (playlist === undefined || playlist === "media" || playlist === "variant") {
        hlsSignalingData = element.text;
      } else if (playlist === "master" || playlist === "multiVariant") {
        // accept the legacy "master" value and the CPIX 2.3 "multiVariant"
        hlsSignalingDataMaster = element.text;
      }
    }
    const ssphd = node.find("{*}SmoothStreamingProtectionHeaderData");

    return new DRMSystem({
      kid,
      systemId,
      pssh,
      contentProtectionData,
      hlsSignalingData,
      hlsSignalingDataMaster,
      smoothStreamingProtectionHeaderData: ssphd !== null ? ssphd.text : null,
    });
  }
}

export class DRMSystemList extends CpixList<DRMSystem> {
  check(value: DRMSystem): void {
    if (!(value instanceof DRMSystem)) throw new TypeError(`${value} is not a DRMSystem`);
  }

  element(version: CpixVersion = LATEST_CPIX_VERSION): Element {
    const el = new Element("DRMSystemList");
    for (const drmSystem of this) el.append(drmSystem.element(version));
    return el;
  }

  static parse(xml: string | ParsedNode): DRMSystemList {
    const node = asNode(xml);
    const list = new DRMSystemList();
    for (const element of node.getchildren()) {
      if (element.localName === "DRMSystem") list.append(DRMSystem.parse(element));
    }
    return list;
  }
}
