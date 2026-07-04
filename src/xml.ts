/**
 * Minimal XML element model + serializer that reproduces `lxml.etree`'s output
 * byte-for-byte for the subset of features used here.
 *
 * Why hand-rolled: a generic DOM serializer does not match lxml's namespace
 * declaration ordering, its skipping of redundant re-declarations, or its
 * quirk of *not* emitting `xmlns=""` for a no-namespace element nested inside
 * a default-namespaced ancestor. The CPIX test-suite asserts exact bytes, so
 * the serializer must match lxml precisely.
 */

/** An ordered namespace map: `[prefix | null, uri]`, `null` prefix = default. */
export type NsMap = ReadonlyArray<readonly [string | null, string]>;

interface QName {
  ns?: string;
  local: string;
}

function parseQName(tag: string): QName {
  if (tag.startsWith("{")) {
    const end = tag.indexOf("}");
    return { ns: tag.slice(1, end), local: tag.slice(end + 1) };
  }
  return { local: tag };
}

interface Attr {
  ns?: string;
  local: string;
  value: string;
}

export class Element {
  readonly ns?: string;
  readonly local: string;
  readonly declarations: Array<[string | null, string]>;
  readonly attribs: Attr[] = [];
  readonly children: Element[] = [];
  text?: string;

  constructor(tag: string, nsmap?: NsMap) {
    const q = parseQName(tag);
    this.ns = q.ns;
    this.local = q.local;
    this.declarations = nsmap ? nsmap.map(([p, u]) => [p, u]) : [];
  }

  set(name: string, value: string): void {
    const q = parseQName(name);
    this.attribs.push({ ns: q.ns, local: q.local, value });
  }

  append(child: Element): void {
    this.children.push(child);
  }
}

export function subElement(
  parent: Element,
  tag: string,
  nsmap?: NsMap,
): Element {
  const el = new Element(tag, nsmap);
  parent.append(el);
  return el;
}

type Binding = [string | null, string];

function prefixFor(scope: Binding[], uri: string): string | null {
  // Latest matching binding wins (innermost scope).
  for (let i = scope.length - 1; i >= 0; i--) {
    if (scope[i][1] === uri) return scope[i][0];
  }
  throw new Error(`no prefix in scope for namespace ${uri}`);
}

function boundTo(scope: Binding[], prefix: string | null): string | undefined {
  for (let i = scope.length - 1; i >= 0; i--) {
    if (scope[i][0] === prefix) return scope[i][1];
  }
  return undefined;
}

function escapeText(s: string): string {
  // lxml escapes & < > in text and CR (to survive attribute-style
  // normalization); tab/newline stay literal in text content.
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r/g, "&#13;");
}

function escapeAttr(s: string): string {
  // lxml escapes & < > " and the control chars \t \n \r as numeric
  // references (raw whitespace would be collapsed on reparse).
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\t/g, "&#9;")
    .replace(/\n/g, "&#10;")
    .replace(/\r/g, "&#13;");
}

function qualify(prefix: string | null, local: string): string {
  return prefix === null || prefix === "" ? local : `${prefix}:${local}`;
}

function serialize(el: Element, parentScope: Binding[]): string {
  const scope = parentScope.slice();
  const emitted: string[] = [];

  for (const [prefix, uri] of el.declarations) {
    if (boundTo(scope, prefix) === uri) continue; // already in scope, skip
    scope.push([prefix, uri]);
    emitted.push(
      prefix === null
        ? ` xmlns="${escapeAttr(uri)}"`
        : ` xmlns:${prefix}="${escapeAttr(uri)}"`,
    );
  }

  const name =
    el.ns === undefined
      ? el.local
      : qualify(prefixFor(scope, el.ns), el.local);

  let open = `<${name}${emitted.join("")}`;
  for (const attr of el.attribs) {
    const attrName =
      attr.ns === undefined
        ? attr.local
        : qualify(prefixFor(scope, attr.ns), attr.local);
    open += ` ${attrName}="${escapeAttr(attr.value)}"`;
  }

  // lxml: self-close only when there are no children AND text is null.
  // An empty-string text still renders as <x></x>.
  if (el.children.length === 0 && (el.text === undefined || el.text === null)) {
    return `${open}/>`;
  }

  let out = `${open}>`;
  if (el.text !== undefined && el.text !== null) out += escapeText(el.text);
  for (const child of el.children) out += serialize(child, scope);
  out += `</${name}>`;
  return out;
}

/** Serialize an element to a string, matching `etree.tostring(el)`. */
export function tostring(el: Element): string {
  return serialize(el, []);
}

function serializePretty(el: Element, parentScope: Binding[], depth: number): string {
  const scope = parentScope.slice();
  const emitted: string[] = [];
  for (const [prefix, uri] of el.declarations) {
    if (boundTo(scope, prefix) === uri) continue;
    scope.push([prefix, uri]);
    emitted.push(
      prefix === null
        ? ` xmlns="${escapeAttr(uri)}"`
        : ` xmlns:${prefix}="${escapeAttr(uri)}"`,
    );
  }
  const name = el.ns === undefined ? el.local : qualify(prefixFor(scope, el.ns), el.local);
  const indent = "  ".repeat(depth);
  let open = `${indent}<${name}${emitted.join("")}`;
  for (const attr of el.attribs) {
    const attrName =
      attr.ns === undefined ? attr.local : qualify(prefixFor(scope, attr.ns), attr.local);
    open += ` ${attrName}="${escapeAttr(attr.value)}"`;
  }
  if (el.children.length === 0 && (el.text === undefined || el.text === null)) {
    return `${open}/>\n`;
  }
  if (el.children.length === 0) {
    return `${open}>${escapeText(el.text ?? "")}</${name}>\n`;
  }
  let out = `${open}>\n`;
  for (const child of el.children) out += serializePretty(child, scope, depth + 1);
  out += `${indent}</${name}>\n`;
  return out;
}

export interface PrettyOptions {
  xmlDeclaration?: boolean;
  encoding?: string;
}

/**
 * Pretty-print an element with two-space indentation, roughly matching
 * `etree.tostring(el, pretty_print=True)`. Exact whitespace may differ from
 * lxml; the compact {@link tostring} form is the byte-exact one.
 */
export function tostringPretty(el: Element, opts: PrettyOptions = {}): string {
  let out = "";
  if (opts.xmlDeclaration) {
    const enc = opts.encoding ?? "utf-8";
    out += `<?xml version='1.0' encoding='${enc}'?>\n`;
  }
  return out + serializePretty(el, [], 0);
}
