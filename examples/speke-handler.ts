/**
 * Shared, transport-agnostic SPEKE request handling for the runtime examples.
 *
 * The library itself ships no server — `handleSpeke`/`validateSpekeV2` are the
 * reusable pieces. This file is what a SPEKE proxy / key server / test harness
 * would write on top of them: turn a request body into a status + response
 * body. Each runtime example (`speke.node.ts`, `speke.bun.ts`) only supplies
 * the `serve` glue.
 *
 * In your own project, import from `"cpixts/speke"` instead of `"../src/…"`.
 */
import { handleSpeke, validateSpekeV2, type HandleSpekeOptions } from "../src/speke/index.js";
import { CPIX } from "../src/index.js";

export interface SpekeResult {
  status: number;
  contentType: string;
  body: string;
}

/** Example configuration — swap the key provider + URLs for real ones. */
export const spekeOptions: HandleSpekeOptions = {
  widevineProvider: "example",
  playreadyLaUrl: "https://example.com/playready",
};

/** Turn a SPEKE request body into a response, independent of any HTTP server. */
export async function handleSpekeRequest(
  requestXml: string,
  options: HandleSpekeOptions = spekeOptions,
): Promise<SpekeResult> {
  try {
    const responseXml = await handleSpeke(requestXml, options);
    const [ok, errors] = validateSpekeV2(CPIX.parse(responseXml));
    if (!ok) console.warn("SPEKE response failed validation:", errors);
    return { status: 200, contentType: "application/xml", body: responseXml };
  } catch (err) {
    return { status: 400, contentType: "text/plain", body: String(err) };
  }
}
