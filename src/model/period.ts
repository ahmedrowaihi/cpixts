/** Period (ContentKeyPeriod) and PeriodList classes. */
import { Element } from "../xml.js";
import { ComparableBase, CpixList } from "../base.js";
import { ValueError } from "../errors.js";
import { NSMAP } from "../constants.js";
import { ParsedNode, fromString } from "../dom.js";

function asNode(xml: string | ParsedNode): ParsedNode {
  return typeof xml === "string" ? fromString(xml) : xml;
}

const ISO_DATETIME = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;

/**
 * A parsed datetime: `date` (a JS instant, for the accessor) plus `iso`, the
 * `isodate.datetime_isoformat`-compatible serialization. `isodate` drops
 * fractional seconds and preserves the original UTC offset (or its absence),
 * so — unlike `Date.toISOString()` — a `+02:00` or naive input is not
 * normalized to `Z`.
 */
interface Datetime {
  date: Date;
  iso: string;
}

function toDatetime(value: Date | string, field: string): Datetime {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new TypeError(`${field} should be a datetime`);
    return { date: value, iso: value.toISOString().replace(/\.\d{3}Z$/, "Z") };
  }
  const m = ISO_DATETIME.exec(value);
  const date = new Date(value);
  if (!m || Number.isNaN(date.getTime())) throw new TypeError(`${field} should be a datetime`);
  return { date, iso: `${m[1]}T${m[2]}${m[3] ?? ""}` };
}

export interface PeriodOptions {
  id: string;
  index?: number | null;
  start?: Date | string | null;
  end?: Date | string | null;
}

export class Period extends ComparableBase {
  private _id!: string;
  private _index: number | null = null;
  private _start: Date | null = null;
  private _startIso: string | null = null;
  private _end: Date | null = null;
  private _endIso: string | null = null;

  constructor(opts: PeriodOptions) {
    super();
    this.id = opts.id;
    this.index = opts.index ?? null;
    this.start = opts.start ?? null;
    this.end = opts.end ?? null;
  }

  get id(): string {
    return this._id;
  }
  set id(id: string) {
    if (typeof id !== "string") throw new TypeError("id should be a string");
    this._id = id;
  }

  get index(): number | null {
    return this._index;
  }
  set index(index: number | null) {
    if (index !== null) {
      if (this._start !== null || this._end !== null)
        throw new ValueError("index is mutually exclusive with start and end");
      if (Number.isInteger(index)) {
        this._index = index;
      } else {
        throw new TypeError("index should be a int");
      }
    }
  }

  get start(): Date | null {
    return this._start;
  }
  set start(start: Date | string | null) {
    if (start !== null) {
      if (this._index !== null) throw new ValueError("start is mutually exclusive with index");
      const { date, iso } = toDatetime(start, "start");
      this._start = date;
      this._startIso = iso;
    }
  }

  get end(): Date | null {
    return this._end;
  }
  set end(end: Date | string | null) {
    if (end !== null) {
      if (this._index !== null) throw new ValueError("end is mutually exclusive with index");
      const { date, iso } = toDatetime(end, "end");
      this._end = date;
      this._endIso = iso;
    }
  }

  element(): Element {
    const el = new Element("ContentKeyPeriod", NSMAP);
    el.set("id", String(this.id));
    if (this.index !== null) el.set("index", String(this.index));
    if (this._startIso !== null) el.set("start", this._startIso);
    if (this._endIso !== null) el.set("end", this._endIso);
    return el;
  }

  static parse(xml: string | ParsedNode): Period {
    const node = asNode(xml);
    const a = node.attrib;
    return new Period({
      id: a["id"],
      index: "index" in a ? parseInt(a["index"], 10) : null,
      start: "start" in a ? a["start"] : null,
      end: "end" in a ? a["end"] : null,
    });
  }
}

export class PeriodList extends CpixList<Period> {
  check(value: Period): void {
    if (!(value instanceof Period)) throw new TypeError(`${value} is not a Period`);
  }

  element(): Element {
    const el = new Element("ContentKeyPeriodList", NSMAP);
    for (const period of this) el.append(period.element());
    return el;
  }

  static parse(xml: string | ParsedNode): PeriodList {
    const node = asNode(xml);
    const list = new PeriodList();
    for (const element of node.getchildren()) {
      if (element.localName === "ContentKeyPeriod") list.append(Period.parse(element));
    }
    return list;
  }
}
