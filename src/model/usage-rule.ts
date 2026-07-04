/** ContentKeyUsageRule / ContentKeyUsageRuleList and the default usage rules. */
import { Element } from "../xml.js";
import { CpixList } from "../base.js";
import { Uuid, toUuid } from "../uuid.js";
import { ParsedNode, fromString } from "../dom.js";
import {
  AudioFilter,
  BitrateFilter,
  KeyPeriodFilter,
  LabelFilter,
  VideoFilter,
  type Filter,
  type FilterValue,
} from "./filters.js";

function asNode(xml: string | ParsedNode): ParsedNode {
  return typeof xml === "string" ? fromString(xml) : xml;
}

const FILTER_PARSERS: Record<string, (n: ParsedNode) => Filter> = {
  KeyPeriodFilter: KeyPeriodFilter.parse,
  LabelFilter: LabelFilter.parse,
  VideoFilter: VideoFilter.parse,
  AudioFilter: AudioFilter.parse,
  BitrateFilter: BitrateFilter.parse,
};

export interface UsageRuleOptions {
  kid: string | Uuid;
  filters?: Filter[];
  intendedTrackType?: FilterValue;
}

export class UsageRule extends CpixList<Filter> {
  private _kid!: Uuid;
  intendedTrackType: FilterValue;

  constructor(opts: UsageRuleOptions) {
    super();
    for (const filter of opts.filters ?? []) this.append(filter);
    this.kid = opts.kid;
    this.intendedTrackType = opts.intendedTrackType ?? null;
  }

  get kid(): Uuid {
    return this._kid;
  }
  set kid(kid: string | Uuid) {
    this._kid = toUuid(kid);
  }

  check(value: Filter): void {
    const ok =
      value instanceof KeyPeriodFilter ||
      value instanceof LabelFilter ||
      value instanceof AudioFilter ||
      value instanceof VideoFilter ||
      value instanceof BitrateFilter;
    if (!ok) {
      throw new TypeError(
        `${value} is not filter (KeyPeriodFilter, LabelFilter, AudioFilter, VideoFilter, BitrateFilter)`,
      );
    }
  }

  element(): Element {
    const el = new Element("ContentKeyUsageRule");
    if (this.kid != null) el.set("kid", String(this.kid));
    if (this.intendedTrackType !== null && this.intendedTrackType !== undefined)
      el.set("intendedTrackType", String(this.intendedTrackType));
    for (const filter of this) el.append(filter.element());
    return el;
  }

  static parse(xml: string | ParsedNode): UsageRule {
    const node = asNode(xml);
    const rule = new UsageRule({ kid: node.attrib["kid"] });

    if ("intendedTrackType" in node.attrib) rule.intendedTrackType = node.attrib["intendedTrackType"];

    for (const element of node.getchildren()) {
      const parser = FILTER_PARSERS[element.localName];
      if (parser) rule.append(parser(element));
    }

    return rule;
  }
}

export class UsageRuleList extends CpixList<UsageRule> {
  check(value: UsageRule): void {
    if (!(value instanceof UsageRule)) throw new TypeError(`${value} is not a UsageRule`);
  }

  element(): Element {
    const el = new Element("ContentKeyUsageRuleList");
    for (const usageRule of this) el.append(usageRule.element());
    return el;
  }

  static parse(xml: string | ParsedNode): UsageRuleList {
    const node = asNode(xml);
    const list = new UsageRuleList();
    for (const element of node.getchildren()) {
      if (element.localName === "ContentKeyUsageRule") list.append(UsageRule.parse(element));
    }
    return list;
  }
}

/** Default usage rule for audio (a single, parameter-less AudioFilter). */
export class AudioUsageRule extends UsageRule {
  constructor(kid: string | Uuid) {
    super({ kid, filters: [new AudioFilter()] });
  }
}

/** Default usage rule for video (a single, parameter-less VideoFilter). */
export class VideoUsageRule extends UsageRule {
  constructor(kid: string | Uuid) {
    super({ kid, filters: [new VideoFilter()] });
  }
}

/** SD video: `maxPixels <= 768 * 576`. */
export class SDVideoUsageRule extends UsageRule {
  constructor(kid: string | Uuid) {
    super({ kid, filters: [new VideoFilter({ maxPixels: 442368 })] });
  }
}

/** HD video: `768*576 < minPixels`, `maxPixels <= 1920 * 1080`. */
export class HDVideoUsageRule extends UsageRule {
  constructor(kid: string | Uuid) {
    super({ kid, filters: [new VideoFilter({ minPixels: 442369, maxPixels: 2073600 })] });
  }
}

/** UHD1 / 4K video: `1920*1080 < minPixels`, `maxPixels <= 4096 * 2160`. */
export class UHD1VideoUsageRule extends UsageRule {
  constructor(kid: string | Uuid) {
    super({ kid, filters: [new VideoFilter({ minPixels: 2073601, maxPixels: 8847360 })] });
  }
}

/** UHD2 / 8K video: `4096*2160 < minPixels`. */
export class UHD2VideoUsageRule extends UsageRule {
  constructor(kid: string | Uuid) {
    super({ kid, filters: [new VideoFilter({ minPixels: 8847361 })] });
  }
}
