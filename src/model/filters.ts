/** Usage-rule filter classes (video/audio/bitrate/label/key-period). */
import { Element } from "../xml.js";
import { ComparableBase } from "../base.js";
import { ParsedNode, fromString } from "../dom.js";
import { ValueError } from "../errors.js";

const XSBOOLEAN_TRUE = ["true", "1"];
const XSBOOLEAN_FALSE = ["false", "0"];

export function parseXsboolean(value: string): boolean {
  if (XSBOOLEAN_FALSE.includes(value)) return false;
  if (XSBOOLEAN_TRUE.includes(value)) return true;
  throw new ValueError(`Invalid xs:boolean value: ${value}`);
}

/** Encode booleans to produce valid XML. */
export function encodeBool(value: boolean): string {
  return value ? "true" : "false";
}

function asNode(xml: string | ParsedNode): ParsedNode {
  return typeof xml === "string" ? fromString(xml) : xml;
}

export type FilterValue = string | number | null | undefined;

export class KeyPeriodFilter extends ComparableBase {
  periodId: FilterValue;

  constructor(periodId: FilterValue) {
    super();
    this.periodId = periodId;
  }

  element(): Element {
    const el = new Element("KeyPeriodFilter");
    el.set("periodId", String(this.periodId));
    return el;
  }

  static parse(xml: string | ParsedNode): KeyPeriodFilter {
    const node = asNode(xml);
    return new KeyPeriodFilter(node.attrib["periodId"]);
  }
}

export class LabelFilter extends ComparableBase {
  label: FilterValue;

  constructor(label: FilterValue) {
    super();
    this.label = label;
  }

  element(): Element {
    const el = new Element("LabelFilter");
    el.set("label", String(this.label));
    return el;
  }

  static parse(xml: string | ParsedNode): LabelFilter {
    const node = asNode(xml);
    return new LabelFilter(node.attrib["label"]);
  }
}

export interface VideoFilterOptions {
  minPixels?: FilterValue;
  maxPixels?: FilterValue;
  hdr?: boolean | null;
  wcg?: boolean | null;
  minFps?: FilterValue;
  maxFps?: FilterValue;
}

export class VideoFilter extends ComparableBase {
  minPixels: FilterValue;
  maxPixels: FilterValue;
  hdr: boolean | null | undefined;
  wcg: boolean | null | undefined;
  minFps: FilterValue;
  maxFps: FilterValue;

  constructor(opts: VideoFilterOptions = {}) {
    super();
    this.minPixels = opts.minPixels ?? null;
    this.maxPixels = opts.maxPixels ?? null;
    this.hdr = opts.hdr ?? null;
    this.wcg = opts.wcg ?? null;
    this.minFps = opts.minFps ?? null;
    this.maxFps = opts.maxFps ?? null;
  }

  element(): Element {
    const el = new Element("VideoFilter");
    if (this.minPixels !== null && this.minPixels !== undefined) el.set("minPixels", String(this.minPixels));
    if (this.maxPixels !== null && this.maxPixels !== undefined) el.set("maxPixels", String(this.maxPixels));
    if (this.hdr !== null && this.hdr !== undefined) el.set("hdr", encodeBool(this.hdr));
    if (this.wcg !== null && this.wcg !== undefined) el.set("wcg", encodeBool(this.wcg));
    if (this.minFps !== null && this.minFps !== undefined) el.set("minFps", String(this.minFps));
    if (this.maxFps !== null && this.maxFps !== undefined) el.set("maxFps", String(this.maxFps));
    return el;
  }

  static parse(xml: string | ParsedNode): VideoFilter {
    const node = asNode(xml);
    const a = node.attrib;
    return new VideoFilter({
      minPixels: "minPixels" in a ? a["minPixels"] : null,
      maxPixels: "maxPixels" in a ? a["maxPixels"] : null,
      hdr: "hdr" in a ? parseXsboolean(a["hdr"]) : null,
      wcg: "wcg" in a ? parseXsboolean(a["wcg"]) : null,
      minFps: "minFps" in a ? a["minFps"] : null,
      maxFps: "maxFps" in a ? a["maxFps"] : null,
    });
  }
}

export class AudioFilter extends ComparableBase {
  minChannels: FilterValue;
  maxChannels: FilterValue;

  constructor(minChannels: FilterValue = null, maxChannels: FilterValue = null) {
    super();
    this.minChannels = minChannels;
    this.maxChannels = maxChannels;
  }

  element(): Element {
    const el = new Element("AudioFilter");
    if (this.minChannels) el.set("minChannels", String(this.minChannels));
    if (this.maxChannels) el.set("maxChannels", String(this.maxChannels));
    return el;
  }

  static parse(xml: string | ParsedNode): AudioFilter {
    const node = asNode(xml);
    const a = node.attrib;
    return new AudioFilter(
      "minChannels" in a ? a["minChannels"] : null,
      "maxChannels" in a ? a["maxChannels"] : null,
    );
  }
}

export class BitrateFilter extends ComparableBase {
  minBitrate: FilterValue;
  maxBitrate: FilterValue;

  constructor(minBitrate: FilterValue = null, maxBitrate: FilterValue = null) {
    super();
    this.minBitrate = minBitrate;
    this.maxBitrate = maxBitrate;
  }

  element(): Element {
    const el = new Element("BitrateFilter");
    if (this.minBitrate) el.set("minBitrate", String(this.minBitrate));
    if (this.maxBitrate) el.set("maxBitrate", String(this.maxBitrate));
    return el;
  }

  static parse(xml: string | ParsedNode): BitrateFilter {
    const node = asNode(xml);
    const a = node.attrib;
    return new BitrateFilter(
      "minBitrate" in a ? a["minBitrate"] : null,
      "maxBitrate" in a ? a["maxBitrate"] : null,
    );
  }
}

export type Filter =
  | KeyPeriodFilter
  | LabelFilter
  | VideoFilter
  | AudioFilter
  | BitrateFilter;
