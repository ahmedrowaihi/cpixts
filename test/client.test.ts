import { describe, it, expect } from "vitest";
import { CPIX, ContentKey, ContentKeyList } from "../src/index.js";
import { CpixClient, CpixHttpError, basicAuth, bearerAuth, headerAuth } from "../src/client/index.js";

const KID = "0dc3ec4f-7683-548b-81e7-3c64e582e136";
const CEK = "WADwG2qCqkq5TVml+U5PXw==";

// A fake fetch that records calls and returns a scripted response.
function fakeFetch(responder: (url: string, init: RequestInit) => { status?: number; body: string; headers?: Record<string, string> }) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const r = responder(url, init);
    return new Response(r.body, { status: r.status ?? 200, headers: r.headers });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

const keyResponse = new CPIX({
  version: "2.3",
  contentKeys: new ContentKeyList(new ContentKey({ kid: KID, cek: CEK })),
}).toString();

describe("CpixClient", () => {
  it("Encryptor-Consumer round-trip: send kids, get keys back", async () => {
    const { fn, calls } = fakeFetch(() => ({ body: keyResponse }));
    const client = new CpixClient({ endpoint: "https://keys.example/cpix", fetch: fn });

    const request = new CPIX({ version: "2.3", contentKeys: new ContentKeyList(new ContentKey({ kid: KID })) });
    const res = await client.request(request);

    // request went out with no key material
    expect(calls[0].init.method).toBe("POST");
    expect(calls[0].init.body).not.toContain("PlainValue");
    // response parsed, key extracted via accessor
    expect(res.status).toBe(200);
    expect(res.cpix.keyFor(KID)?.cek).toBe(CEK);
  });

  it("Encryptor-Producer round-trip: send keys, server accepts", async () => {
    const { fn, calls } = fakeFetch(() => ({ status: 200, body: keyResponse }));
    const client = new CpixClient({ endpoint: "https://keys.example/cpix", fetch: fn });

    const request = new CPIX({ version: "2.3", contentKeys: new ContentKeyList(new ContentKey({ kid: KID, cek: CEK })) });
    const res = await client.request(request);

    expect(calls[0].init.body).toContain("PlainValue"); // keys were sent
    expect(res.status).toBe(200);
  });

  it("throws CpixHttpError on a non-2xx response", async () => {
    const { fn } = fakeFetch(() => ({ status: 500, body: "boom" }));
    const client = new CpixClient({ endpoint: "https://keys.example/cpix", fetch: fn });
    await expect(client.request(new CPIX())).rejects.toMatchObject({ status: 500, body: "boom" });
    await expect(client.request(new CPIX())).rejects.toBeInstanceOf(CpixHttpError);
  });

  it("injects auth headers and content type (vendor specifics stay in the caller)", async () => {
    const { fn, calls } = fakeFetch(() => ({ body: keyResponse }));
    const client = new CpixClient({
      endpoint: "https://keys.example/cpix",
      fetch: fn,
      auth: headerAuth("X-Vendor-Token", () => "abc123"), // provider auth via the generic escape hatch
      headers: { "X-Request-Id": "r1" },
    });
    await client.request(new CPIX({ contentKeys: new ContentKeyList(new ContentKey({ kid: KID })) }));

    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers["X-Vendor-Token"]).toBe("abc123");
    expect(headers["X-Request-Id"]).toBe("r1");
    expect(headers["content-type"]).toBe("application/xml");
  });

  it("serializes to the requested CPIX version", async () => {
    const { fn, calls } = fakeFetch(() => ({ body: keyResponse }));
    const client = new CpixClient({ endpoint: "https://keys.example/cpix", fetch: fn, version: "2.2" });
    await client.request(new CPIX({ contentKeys: new ContentKeyList(new ContentKey({ kid: KID, cek: CEK })) }));
    // 2.2 output omits commonEncryptionScheme
    expect(calls[0].init.body).not.toContain("commonEncryptionScheme");
  });
});

describe("auth helpers", () => {
  it("basicAuth builds an RFC 7617 header", async () => {
    expect(await basicAuth("user", "pass")({ method: "POST", url: "", body: "" })).toEqual({
      Authorization: "Basic dXNlcjpwYXNz",
    });
  });
  it("bearerAuth supports a getter", async () => {
    expect(await bearerAuth(() => "tok")({ method: "POST", url: "", body: "" })).toEqual({
      Authorization: "Bearer tok",
    });
  });
});
