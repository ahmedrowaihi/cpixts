---
"cpixts": minor
---

Add the caller side of CPIX/SPEKE (vendor-neutral).

- `cpixts/client`: `CpixClient` (POST a CPIX doc, get a parsed `CpixResponse`; throws `CpixHttpError` on non-2xx; injectable `fetch`), plus RFC-standard auth helpers `basicAuth`, `bearerAuth`, and the `headerAuth` escape hatch. Endpoints and auth are injected by the caller — no provider specifics in the library.
- `cpixts/speke`: `buildSpekeRequest` (version-aware — v1 omits the rotation block, v2 emits `ContentKeyPeriodList`) and `validateSpekeRequest`.
- Ergonomic accessors on parsed CPIX: `keyFor`, `psshFor`, `hlsKeyUriFor`, `systems`.
- `ContentKey.decrypt(documentKey)` unwraps a document-key-encrypted CEK (DASH-IF CPIX §9).
