/**
 * SPEKE v2 key server on Bun.serve.
 *
 *   bun run examples/speke.bun.ts
 *   curl -s -X POST --data-binary @request.xml http://localhost:8080/speke
 *
 * All the SPEKE logic lives in ./speke-handler; this file is only the serve.
 */
import { handleSpekeRequest } from "./speke-handler.js";

// Minimal Bun.serve typing so this file reads cleanly without @types/bun.
declare const Bun: {
  serve(options: { port?: number; fetch(req: Request): Promise<Response> }): { port: number };
};

const port = Number(process.env.PORT ?? 8080);

Bun.serve({
  port,
  async fetch(req: Request): Promise<Response> {
    if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    const { status, contentType, body } = await handleSpekeRequest(await req.text());
    return new Response(body, { status, headers: { "content-type": contentType } });
  },
});

console.log(`SPEKE v2 (bun) on http://localhost:${port}`);
