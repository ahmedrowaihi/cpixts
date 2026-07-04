/**
 * Read-only parsed-XML adapter mirroring the slice of the `lxml` element API
 * used when parsing: `.getchildren()`, `.localName`, `.attrib`, `.text`
 * and the `find`/`findall` patterns (any-namespace, descendant and
 * double-star wildcards).
 *
 * Parsing uses `libxml2-wasm` (the same engine as `validate()`), producing a
 * namespace-aware tree that we normalise into a detached `ParsedNode` graph.
 * The underlying `XmlDocument` is disposed immediately after normalisation, so
 * there is no wasm memory to manage downstream.
 */
import { XmlDocument, XmlElement, XmlText, XmlCData } from "libxml2-wasm";

interface PatternMatch {
  local: string;
  ns: string | "*" | null; // null = no namespace filter beyond localName
  descendant: boolean;
}

function parsePattern(pattern: string): PatternMatch {
  let descendant = false;
  let rest = pattern;
  if (rest.startsWith(".//")) {
    descendant = true;
    rest = rest.slice(3);
  } else if (rest.startsWith("**/")) {
    descendant = true;
    rest = rest.slice(3);
  }
  let ns: string | "*" | null = null;
  if (rest.startsWith("{")) {
    const end = rest.indexOf("}");
    const uri = rest.slice(1, end);
    ns = uri === "*" ? "*" : uri;
    rest = rest.slice(end + 1);
  }
  return { local: rest, ns, descendant };
}

export class ParsedNode {
  readonly localName: string;
  readonly namespaceURI: string | null;
  readonly attrib: Record<string, string>;
  readonly text: string | null;
  readonly children: ParsedNode[];

  private constructor(el: XmlElement) {
    this.localName = el.name;
    // libxml2 reports the empty string for no namespace; normalise to null.
    this.namespaceURI = el.namespaceUri === "" ? null : el.namespaceUri;

    this.attrib = {};
    // `attrs` already excludes xmlns declarations; key by local name.
    for (const attr of el.attrs) this.attrib[attr.name] = attr.value;

    // lxml `.text`: character data before the first child element.
    let text: string | null = null;
    this.children = [];
    for (let node = el.firstChild; node; node = node.next) {
      if (node instanceof XmlElement) {
        this.children.push(new ParsedNode(node));
      } else if ((node instanceof XmlText || node instanceof XmlCData) && this.children.length === 0) {
        text = (text ?? "") + node.content;
      }
    }
    this.text = text;
  }

  static fromString(xml: string): ParsedNode {
    const doc = XmlDocument.fromString(xml);
    try {
      const root = doc.root;
      if (!root) throw new TypeError("not valid xml");
      return new ParsedNode(root);
    } finally {
      doc.dispose();
    }
  }

  getchildren(): ParsedNode[] {
    return this.children;
  }

  private matches(node: ParsedNode, m: PatternMatch): boolean {
    if (node.localName !== m.local) return false;
    if (m.ns === null || m.ns === "*") return true;
    return node.namespaceURI === m.ns;
  }

  private search(m: PatternMatch): ParsedNode[] {
    const results: ParsedNode[] = [];
    if (m.descendant) {
      const walk = (node: ParsedNode) => {
        for (const child of node.children) {
          if (this.matches(child, m)) results.push(child);
          walk(child);
        }
      };
      walk(this);
    } else {
      for (const child of this.children) {
        if (this.matches(child, m)) results.push(child);
      }
    }
    return results;
  }

  find(pattern: string): ParsedNode | null {
    return this.search(parsePattern(pattern))[0] ?? null;
  }

  findall(pattern: string): ParsedNode[] {
    return this.search(parsePattern(pattern));
  }
}

/** Parse an XML string into a {@link ParsedNode}. */
export function fromString(xml: string): ParsedNode {
  return ParsedNode.fromString(xml);
}
