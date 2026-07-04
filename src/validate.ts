/**
 * CPIX XSD validation via libxml2-wasm. Schemas for every supported CPIX
 * version are embedded (the `cpix.xsd` per version imports three shared
 * schemas); we serve those to libxml2 through an in-memory input provider so
 * validation works with no filesystem access (browser included).
 */
import {
  XmlDocument,
  XsdValidator,
  XmlBufferInputProvider,
  xmlRegisterInputProvider,
  XmlValidateError,
} from "libxml2-wasm";
import { PSKC_XSD, XENC_XSD, XMLDSIG_XSD, CPIX_SCHEMAS } from "./schemas.js";
import { LATEST_CPIX_VERSION, coerceCpixVersion, type CpixVersion } from "./version.js";
import { fromString } from "./dom.js";

export type { CpixVersion } from "./version.js";
export { LATEST_CPIX_VERSION, SUPPORTED_CPIX_VERSIONS } from "./version.js";

const encoder = new TextEncoder();

let importsRegistered = false;

function registerSharedImports(): void {
  if (importsRegistered) return;
  const provider = new XmlBufferInputProvider({
    "pskc.xsd": encoder.encode(PSKC_XSD),
    "xenc-schema.xsd": encoder.encode(XENC_XSD),
    "xmldsig-core-schema.xsd": encoder.encode(XMLDSIG_XSD),
  });
  xmlRegisterInputProvider(provider);
  importsRegistered = true;
}

const validators = new Map<string, XsdValidator>();

function validatorFor(schemaXsd: string, cacheKey: string): XsdValidator {
  let validator = validators.get(cacheKey);
  if (validator) return validator;
  registerSharedImports();
  const xsdDoc = XmlDocument.fromString(schemaXsd, { url: "cpix.xsd" });
  validator = XsdValidator.fromDoc(xsdDoc);
  validators.set(cacheKey, validator);
  return validator;
}

export interface ValidateOptions {
  /**
   * CPIX version to validate against. When omitted, the document's own
   * `version` attribute is used (falling back to the latest bundled version).
   */
  version?: CpixVersion;
  /** A custom XSD to validate against instead of a bundled version. */
  schema?: string;
}

/** The document's declared `version`, or the latest version if none/unknown. */
function resolveVersion(xml: string, options: ValidateOptions): CpixVersion {
  if (options.version) return options.version;
  try {
    return coerceCpixVersion(fromString(xml).attrib["version"]) ?? LATEST_CPIX_VERSION;
  } catch {
    return LATEST_CPIX_VERSION;
  }
}

/**
 * Validate a CPIX document against a bundled schema or a custom one
 * (`options.schema`). The version is taken from `options.version`, else the
 * document's `version` attribute, else the latest bundled version.
 *
 * @returns `[true, ""]` when valid, otherwise `[false, error]`.
 */
export function validate(xml: string, options: ValidateOptions = {}): [boolean, string] {
  const version = resolveVersion(xml, options);
  const validator = options.schema
    ? validatorFor(options.schema, options.schema)
    : validatorFor(CPIX_SCHEMAS[version], version);

  const doc = XmlDocument.fromString(xml);
  try {
    validator.validate(doc);
    return [true, ""];
  } catch (e) {
    if (e instanceof XmlValidateError) return [false, String(e)];
    throw e;
  } finally {
    doc.dispose();
  }
}
