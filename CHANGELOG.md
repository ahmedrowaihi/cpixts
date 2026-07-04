# cpixts

## 0.2.0

### Minor Changes

- [`ce33438`](https://github.com/ahmedrowaihi/cpixts/commit/ce334387f7cbaed1d1978446bfd339c06acf29f2) Thanks [@ahmedrowaihi](https://github.com/ahmedrowaihi)! - Add the caller side of CPIX/SPEKE (vendor-neutral).

  - `cpixts/client`: `CpixClient` (POST a CPIX doc, get a parsed `CpixResponse`; throws `CpixHttpError` on non-2xx; injectable `fetch`), plus RFC-standard auth helpers `basicAuth`, `bearerAuth`, and the `headerAuth` escape hatch. Endpoints and auth are injected by the caller — no provider specifics in the library.
  - `cpixts/speke`: `buildSpekeRequest` and `validateSpekeRequest`. A `ContentKeyPeriodList`/`KeyPeriodFilter` block is emitted only when `rotation` is passed — key rotation is standard CPIX supported by both SPEKE v1 and v2, never tied to the version. `validateSpekeRequest(cpix, policy?)` accepts a caller policy (e.g. `{ allowRotation: false }`) for profile-specific rules. Exports `SPEKE_VERSION_HEADER`.
  - Ergonomic accessors on parsed CPIX: `keyFor`, `psshFor`, `hlsKeyUriFor`, `systems`.
  - `ContentKey.decrypt(documentKey)` unwraps a document-key-encrypted CEK (DASH-IF CPIX §9), returning the raw key bytes.
