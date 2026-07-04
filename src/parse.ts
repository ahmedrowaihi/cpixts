/**
 * Top-level `parse`: read the root element name and dispatch to the matching
 * class's `parse`, dispatching by the root element's local name.
 */
import { fromString, ParsedNode } from "./dom.js";
import { CPIX } from "./model/cpix.js";
import { ContentKey, ContentKeyList } from "./model/content-key.js";
import { DRMSystem, DRMSystemList } from "./model/drm-system.js";
import {
  AudioFilter,
  BitrateFilter,
  KeyPeriodFilter,
  LabelFilter,
  VideoFilter,
} from "./model/filters.js";
import {
  DeliveryData,
  DeliveryDataList,
  DeliveryKey,
  DocumentKey,
  MACMethod,
} from "./model/delivery-data.js";

const PARSERS: Record<string, (node: ParsedNode) => unknown> = {
  CPIX: CPIX.parse,
  ContentKey: ContentKey.parse,
  ContentKeyList: ContentKeyList.parse,
  DRMSystem: DRMSystem.parse,
  DRMSystemList: DRMSystemList.parse,
  VideoFilter: VideoFilter.parse,
  AudioFilter: AudioFilter.parse,
  BitrateFilter: BitrateFilter.parse,
  LabelFilter: LabelFilter.parse,
  KeyPeriodFilter: KeyPeriodFilter.parse,
  DeliveryData: DeliveryData.parse,
  DeliveryDataList: DeliveryDataList.parse,
  DeliveryKey: DeliveryKey.parse,
  DocumentKey: DocumentKey.parse,
  MACMethod: MACMethod.parse,
};

/**
 * Parse a CPIX XML fragment, dispatching on the root element to the relevant
 * type. Throws if the root element has no corresponding parser.
 */
export function parse(xml: string | ParsedNode): unknown {
  const node = typeof xml === "string" ? fromString(xml) : xml;
  const parser = PARSERS[node.localName];
  if (!parser) throw new Error(`no parser for element ${node.localName}`);
  return parser(node);
}
