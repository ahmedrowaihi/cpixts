/**
 * Generic client for calling a CPIX / SPEKE key server — the counterpart to
 * `handleSpeke`. Deliberately vendor-neutral: endpoints and auth are injected
 * by the caller, never baked in. Provider-specific request signing (SigV4,
 * proprietary tokens) belongs in the caller's `CpixAuth`, not here.
 */
import { CPIX } from "../model/cpix.js";
import { toBytes, b64encode } from "../base64.js";
import type { CpixVersion } from "../version.js";

/**
 * Produces request headers for a single call. Return the headers to add (e.g.
 * `Authorization`). Async so callers can mint short-lived credentials.
 */
export type CpixAuth = (ctx: {
  method: string;
  url: string;
  body: string;
}) => Record<string, string> | Promise<Record<string, string>>;

/** HTTP Basic auth (RFC 7617). */
export function basicAuth(user: string, pass: string): CpixAuth {
  const header = `Basic ${b64encode(toBytes(`${user}:${pass}`))}`;
  return () => ({ Authorization: header });
}

/** Bearer token auth (RFC 6750). Accepts a value or a (possibly async) getter. */
export function bearerAuth(token: string | (() => string | Promise<string>)): CpixAuth {
  return async () => ({ Authorization: `Bearer ${typeof token === "function" ? await token() : token}` });
}

/** Escape hatch: set any single header (e.g. a provider's own auth header). */
export function headerAuth(name: string, value: string | (() => string | Promise<string>)): CpixAuth {
  return async () => ({ [name]: typeof value === "function" ? await value() : value });
}

/** Thrown by {@link CpixClient.request} on a non-2xx response. */
export class CpixHttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`CPIX request failed with status ${status}`);
    this.name = "CpixHttpError";
  }
}

/** A parsed CPIX response plus the raw HTTP details. */
export class CpixResponse {
  constructor(
    /** The parsed response document. */
    readonly cpix: CPIX,
    readonly status: number,
    readonly headers: Record<string, string>,
    /** The raw response body. */
    readonly xml: string,
  ) {}
}

export interface CpixClientOptions {
  /** Key-server URL to POST to. */
  endpoint: string;
  /** `fetch` implementation (default `globalThis.fetch`); inject for tests. */
  fetch?: typeof fetch;
  /** Auth header producer (default: none). */
  auth?: CpixAuth;
  /** Static headers merged into every request. */
  headers?: Record<string, string>;
  /** Serialization target version (default: the document's own). */
  version?: CpixVersion;
  /** Request content type (default `application/xml`). */
  contentType?: string;
}

/**
 * POSTs a CPIX document to a key server and parses the reply. Stays agnostic
 * about *why* — it works for both the Encryptor-Consumer flow (send kids
 * without keys, get keys back) and the Encryptor-Producer flow (send keys to
 * be stored). It just ships a document and parses the response.
 */
export class CpixClient {
  private readonly endpoint: string;
  private readonly fetchImpl?: typeof fetch;
  private readonly auth?: CpixAuth;
  private readonly headers: Record<string, string>;
  private readonly version?: CpixVersion;
  private readonly contentType: string;

  constructor(opts: CpixClientOptions) {
    this.endpoint = opts.endpoint;
    this.fetchImpl = opts.fetch ?? (typeof fetch !== "undefined" ? fetch : undefined);
    this.auth = opts.auth;
    this.headers = opts.headers ?? {};
    this.version = opts.version;
    this.contentType = opts.contentType ?? "application/xml";
  }

  async request(doc: CPIX): Promise<CpixResponse> {
    if (!this.fetchImpl) throw new Error("no fetch available; pass options.fetch");
    const body = doc.toString({ version: this.version });

    const headers: Record<string, string> = { "content-type": this.contentType, ...this.headers };
    if (this.auth) Object.assign(headers, await this.auth({ method: "POST", url: this.endpoint, body }));

    const res = await this.fetchImpl(this.endpoint, { method: "POST", headers, body });
    const text = await res.text();

    if (!res.ok) throw new CpixHttpError(res.status, text);

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    return new CpixResponse(CPIX.parse(text), res.status, responseHeaders, text);
  }
}
