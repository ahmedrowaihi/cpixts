/**
 * Base classes shared by every CPIX model type.
 *
 * `ComparableBase` mirrors `CPIXComparableBase`: value equality and ordering
 * are defined by the element's serialized XML. `CpixList` mirrors
 * `CPIXListBase`: a validated, array-like collection (it extends `Array`, so
 * iteration, `length` and indexing work natively; use `splice` where Python
 * used `del list[i]`).
 */
import { Element, tostring, tostringPretty, type PrettyOptions } from "./xml.js";
import type { CpixVersion } from "./version.js";

/** Serialization options: which CPIX version to shape the output for. */
export interface EmitOptions {
  /** Target CPIX version (default `"2.3"`). Controls version-specific output. */
  version?: CpixVersion;
}

export interface HasElement {
  element(version?: CpixVersion): Element;
}

export abstract class ComparableBase implements HasElement {
  abstract element(version?: CpixVersion): Element;

  toString(opts: EmitOptions = {}): string {
    return tostring(this.element(opts.version));
  }

  equals(other: HasElement): boolean {
    return tostring(this.element()) === tostring(other.element());
  }

  prettyPrint(opts: EmitOptions & PrettyOptions = {}): string {
    return tostringPretty(this.element(opts.version), { encoding: "utf-8", ...opts });
  }
}

export abstract class CpixList<T extends HasElement> extends Array<T> {
  // Derived methods (map/filter/slice/splice) build plain arrays, not a
  // validated subclass — otherwise they'd call `new Subclass(length)` and the
  // numeric length would be rejected by `check`.
  static get [Symbol.species](): ArrayConstructor {
    return Array;
  }

  constructor(...items: T[]) {
    super();
    for (const item of items) this.append(item);
  }

  /** Validate a candidate member; throw `TypeError` if it does not belong. */
  abstract check(value: T): void;

  abstract element(version?: CpixVersion): Element;

  append(value: T): void {
    this.check(value);
    this.push(value);
  }

  toString(opts: EmitOptions = {}): string {
    return tostring(this.element(opts.version));
  }

  equals(other: HasElement): boolean {
    return tostring(this.element()) === tostring(other.element());
  }

  prettyPrint(opts: EmitOptions & PrettyOptions = {}): string {
    return tostringPretty(this.element(opts.version), { encoding: "utf-8", ...opts });
  }
}
