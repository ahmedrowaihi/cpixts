/**
 * Shared CPIX constants: XML namespaces, wrapping algorithms and the set of
 * DRM system IDs the library recognises.
 */
import { Uuid } from "./uuid.js";
import type { NsMap } from "./xml.js";

export const PSKC = "urn:ietf:params:xml:ns:keyprov:pskc";
export const XSI = "http://www.w3.org/2001/XMLSchema-instance";
export const DS = "http://www.w3.org/2000/09/xmldsig#";
export const ENC = "http://www.w3.org/2001/04/xmlenc#";
export const CPIX_NS = "urn:dashif:org:cpix";

export const NSMAP: NsMap = [
  [null, CPIX_NS],
  ["xsi", XSI],
  ["pskc", PSKC],
  ["ds", DS],
  ["enc", ENC],
];

export const PLAYREADY_SYSTEM_ID = new Uuid("9a04f079-9840-4286-ab92-e65be0885f95");
export const WIDEVINE_SYSTEM_ID = new Uuid("edef8ba9-79d6-4ace-a3c8-27dcd51d21ed");

export const VALID_SYSTEM_IDS: Uuid[] = [
  new Uuid("1077efec-c0b2-4d02-ace3-3c1e52e2fb4b"), // org.w3.clearkey
  PLAYREADY_SYSTEM_ID, // Microsoft Playready
  new Uuid("F239E769-EFA3-4850-9C16-A903C6932EFB"), // Adobe Primetime DRM
  new Uuid("5E629AF5-38DA-4063-8977-97FFBD9902D4"), // Marlin
  new Uuid("9a27dd82-fde2-4725-8cbc-4234aa06ec09"), // Verimatrix
  WIDEVINE_SYSTEM_ID, // Widevine
  new Uuid("80a6be7e-1448-4c37-9e70-d5aebe04c8d2"), // Irdeto
  new Uuid("279fe473-512c-48fe-ade8-d176fee6b40f"), // Latens
  new Uuid("B4413586-C58C-FFB0-94A5-D4896C1AF6C3"), // Viaccess-Orca DRM
  new Uuid("94CE86FB-07FF-4F43-ADB8-93D2FA968CA2"), // Apple FairPlay
  new Uuid("81376844-F976-481E-A84E-CC25D39B0B33"), // AES-128
  new Uuid("3D5E6D35-9B9A-41E8-B843-DD3C6E72C42C"), // ChinaDRM
];

export const CONTENT_KEY_WRAPPING_ALGORITHM = "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
export const DOCUMENT_KEY_WRAPPING_ALGORITHM = "http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p";
export const ENCRYPTED_KEY_MAC_ALGORITHM = "http://www.w3.org/2001/04/xmldsig-more#hmac-sha512";
