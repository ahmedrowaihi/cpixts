/** Root CPIX document class. */
import { Element } from "../xml.js";
import { ComparableBase } from "../base.js";
import { LATEST_CPIX_VERSION, atLeastVersion, coerceCpixVersion, type CpixVersion } from "../version.js";
import { XSI, NSMAP } from "../constants.js";
import { ContentKeyList } from "./content-key.js";
import { DRMSystemList } from "./drm-system.js";
import { UsageRuleList } from "./usage-rule.js";
import { PeriodList } from "./period.js";
import { DeliveryDataList } from "./delivery-data.js";
import { KeyPeriodFilter } from "./filters.js";
import { ParsedNode, fromString } from "../dom.js";

function asNode(xml: string | ParsedNode): ParsedNode {
  return typeof xml === "string" ? fromString(xml) : xml;
}

export interface CPIXOptions {
  contentKeys?: ContentKeyList;
  drmSystems?: DRMSystemList;
  usageRules?: UsageRuleList;
  periods?: PeriodList;
  contentId?: string | null;
  version?: string | null;
  deliveryDatas?: DeliveryDataList;
}

export class CPIX extends ComparableBase {
  private _contentKeys = new ContentKeyList();
  private _drmSystems = new DRMSystemList();
  private _usageRules = new UsageRuleList();
  private _periods = new PeriodList();
  private _deliveryDatas = new DeliveryDataList();
  private _contentId: string | null = null;
  private _version: string | null = null;

  constructor(opts: CPIXOptions = {}) {
    super();
    if (opts.contentKeys != null) this.contentKeys = opts.contentKeys;
    if (opts.drmSystems != null) this.drmSystems = opts.drmSystems;
    if (opts.usageRules != null) this.usageRules = opts.usageRules;
    if (opts.periods != null) this.periods = opts.periods;
    if (opts.contentId != null) this.contentId = opts.contentId;
    if (opts.deliveryDatas != null) this.deliveryDatas = opts.deliveryDatas;
    this.version = opts.version ?? null;
  }

  get contentKeys(): ContentKeyList {
    return this._contentKeys;
  }
  set contentKeys(value: ContentKeyList) {
    if (!(value instanceof ContentKeyList)) throw new TypeError("content_keys should be a ContentKeyList");
    this._contentKeys = value;
  }

  get drmSystems(): DRMSystemList {
    return this._drmSystems;
  }
  set drmSystems(value: DRMSystemList) {
    if (!(value instanceof DRMSystemList)) throw new TypeError("drm_systems should be a DRMSystemList");
    this._drmSystems = value;
  }

  get usageRules(): UsageRuleList {
    return this._usageRules;
  }
  set usageRules(value: UsageRuleList) {
    if (!(value instanceof UsageRuleList)) throw new TypeError("usage_rules should be a UsageRuleList");
    this._usageRules = value;
  }

  get periods(): PeriodList {
    return this._periods;
  }
  set periods(value: PeriodList) {
    if (!(value instanceof PeriodList)) throw new TypeError("periods should be a PeriodList");
    this._periods = value;
  }

  get deliveryDatas(): DeliveryDataList {
    return this._deliveryDatas;
  }
  set deliveryDatas(value: DeliveryDataList) {
    if (!(value instanceof DeliveryDataList)) throw new TypeError("delivery_datas should be a DeliveryDataList");
    this._deliveryDatas = value;
  }

  get contentId(): string | null {
    return this._contentId;
  }
  set contentId(value: string | null) {
    if (typeof value === "string") {
      this._contentId = value;
    } else if (value === null) {
      this._contentId = null;
    } else {
      throw new TypeError("content_id should be a string");
    }
  }

  get version(): string | null {
    return this._version;
  }
  set version(value: string | null) {
    if (typeof value === "string") {
      this._version = value;
    } else if (value === null) {
      this._version = null;
    } else {
      throw new TypeError("version should be a string");
    }
  }

  element(version?: CpixVersion): Element {
    const target = version ?? coerceCpixVersion(this.version) ?? LATEST_CPIX_VERSION;
    const el = new Element("CPIX", NSMAP);
    el.set(`{${XSI}}schemaLocation`, "urn:dashif:org:cpix cpix.xsd");
    if (this.contentId !== null) el.set("contentId", this.contentId);
    // The CPIX @version attribute was introduced in 2.3.
    if (this.version !== null && atLeastVersion(target, "2.3")) el.set("version", this.version);
    if (this.deliveryDatas.length > 0) el.append(this.deliveryDatas.element());
    // contentKeys and drmSystems have version-specific output; the rest do not.
    if (this.contentKeys.length > 0) el.append(this.contentKeys.element(target));
    if (this.drmSystems.length > 0) el.append(this.drmSystems.element(target));
    if (this.periods.length > 0) el.append(this.periods.element());
    if (this.usageRules.length > 0) el.append(this.usageRules.element());
    return el;
  }

  static parse(xml: string | ParsedNode): CPIX {
    const node = asNode(xml);
    const cpix = new CPIX();

    if ("contentId" in node.attrib) cpix.contentId = node.attrib["contentId"];
    if ("version" in node.attrib) cpix.version = node.attrib["version"];

    for (const element of node.getchildren()) {
      switch (element.localName) {
        case "ContentKeyList":
          cpix.contentKeys = ContentKeyList.parse(element);
          break;
        case "DRMSystemList":
          cpix.drmSystems = DRMSystemList.parse(element);
          break;
        case "ContentKeyUsageRuleList":
          cpix.usageRules = UsageRuleList.parse(element);
          break;
        case "ContentKeyPeriodList":
          cpix.periods = PeriodList.parse(element);
          break;
        case "DeliveryDataList":
          cpix.deliveryDatas = DeliveryDataList.parse(element);
          break;
      }
    }

    return cpix;
  }

  /** Check each usage rule references a valid content key. */
  checkUsageRules(): [boolean, string[]] {
    const keys = this.contentKeys.map((k) => k.kid);
    const errors: string[] = [];
    for (const rule of this.usageRules) {
      if (!keys.some((k) => k.equals(rule.kid)))
        errors.push(`usage rule references missing kid: ${rule.kid}`);
    }
    return [errors.length === 0, errors];
  }

  /** Check each DRM system references a valid content key. */
  checkDrmSystems(): [boolean, string[]] {
    const keys = this.contentKeys.map((k) => k.kid);
    const errors: string[] = [];
    for (const drm of this.drmSystems) {
      if (!keys.some((k) => k.equals(drm.kid)))
        errors.push(`DRM system references missing kid: ${drm.kid}`);
    }
    return [errors.length === 0, errors];
  }

  /** Check each period filter references a valid period. */
  checkPeriodFilters(): [boolean, string[]] {
    const periods = this.periods.map((p) => p.id);
    const errors: string[] = [];
    for (const rule of this.usageRules) {
      for (const filter of rule) {
        if (filter instanceof KeyPeriodFilter && !periods.includes(filter.periodId as string))
          errors.push(`period filter references missing period: ${filter.periodId}`);
      }
    }
    return [errors.length === 0, errors];
  }

  /**
   * Confirm the document is internally consistent: usage rules and DRM
   * systems reference existing content keys, and period filters reference
   * existing periods.
   */
  validateContent(): [boolean, string[]] {
    const errors: string[] = [
      ...this.checkUsageRules()[1],
      ...this.checkDrmSystems()[1],
      ...this.checkPeriodFilters()[1],
    ];
    return [errors.length === 0, errors];
  }
}
