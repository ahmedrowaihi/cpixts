# cpix

A TypeScript library for working with CPIX 2.2 (DASH-IF Content Protection
Information Exchange) documents.

- **CPIX 2.2**: create and parse documents — content keys, DRM systems, usage
  rules, filters, periods, delivery data.
- **DRM helpers**: Widevine (CENC header + PSSH box, key-server) and PlayReady
  (content-key derivation, checksum, WRMHEADER, PSSH box).
- **Isomorphic**: runs in Node and the browser.
- **Byte-exact XML** and tree-shakable ESM.

## Usage

```ts
import { CPIX, ContentKey, ContentKeyList, DRMSystem, DRMSystemList } from "cpixts";

const doc = new CPIX({
  contentKeys: new ContentKeyList(
    new ContentKey({
      kid: "0DC3EC4F-7683-548B-81E7-3C64E582E136",
      cek: "WADwG2qCqkq5TVml+U5PXw==",
    }),
  ),
  drmSystems: new DRMSystemList(
    new DRMSystem({
      kid: "0DC3EC4F-7683-548B-81E7-3C64E582E136",
      systemId: "EDEF8BA9-79D6-4ACE-A3C8-27DCD51D21ED",
      pssh: "AAAAxnBzc2gBAAAA…",
    }),
  ),
});

doc.toString();                     // serialize to XML

import { parse, validate } from "cpixts";
const parsed = parse(xml);          // dispatches on the root element
const [ok, error] = validate(xml);  // XSD validation (CPIX 2.3 by default)
```

### CPIX versions (serialize + validate)

Serialization and validation both take a target version, so building and
validating stay coherent. Target a version on `toString()`/`prettyPrint()`;
the output is shaped for it (e.g. 2.2 omits `commonEncryptionScheme`; the HLS
multivariant playlist is `master` for ≤2.3 and `multiVariant` for 2.4):

```ts
const xml = doc.toString({ version: "2.2" });  // default: "2.3"
validate(xml, { version: "2.2" });             // "2.2" | "2.3" | "2.3.1" | "2.4"

validate(xml);                                 // default: CPIX 2.3
validate(xml, { schema: myXsd });              // any custom XSD (any version)

import { SUPPORTED_CPIX_VERSIONS, LATEST_CPIX_VERSION } from "cpixts";
```

Bundled schemas are the official DASH-IF CPIX 2.2–2.4 XSDs. The `version`
attribute on a `CPIX` document is a separate free-string label you set as
needed — it does not by itself change serialization.

DRM crypto helpers (`drm.widevine`, `drm.playready`) are async — they use
WebCrypto.

## SPEKE v2

The `cpixts/speke` entry point provides an AWS SPEKE v2 request handler and a
cross-field validator for the SPEKE CPIX profile:

```ts
import { handleSpeke, validateSpekeV2, type SpekeKeyProvider } from "cpixts/speke";

const keyProvider: SpekeKeyProvider = {
  getKey: (kid) => ({ cek: /* base64 key from your key store */ "…" }),
};

// requestXml: a CPIX request (kids without keys, DRM systems without PSSH)
const responseXml = await handleSpeke(requestXml, {
  keyProvider,
  widevineProvider: "example",
  playreadyLaUrl: "https://example.com/playready",
});
```

`handleSpeke` mints missing content keys and generates Widevine/PlayReady PSSH;
`validateSpekeV2(cpix)` checks the SPEKE encryption-contract rules (uniform
`commonEncryptionScheme`, unique/mandatory `intendedTrackType`, filter
presence, HLS media/multivariant pairing). Validation uses the official CPIX
2.3 schema.

The library ships no server — `handleSpeke`/`validateSpekeV2` are the reusable
pieces you build a SPEKE proxy, key server, or test harness on. The
[examples/](examples/) show the wiring: [speke-handler.ts](examples/speke-handler.ts)
holds the shared request→response logic, and [speke.node.ts](examples/speke.node.ts)
/ [speke.bun.ts](examples/speke.bun.ts) each add only the `serve` glue.

## Development

```
npm install
npm test        # vitest
npm run build   # tsc -> dist/
```
