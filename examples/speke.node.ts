/**
 * SPEKE v2 key server on Node's http module.
 *
 *   npx tsx examples/speke.node.ts
 *   curl -s -X POST --data-binary @request.xml http://localhost:8080/speke
 *
 * All the SPEKE logic lives in ./speke-handler; this file is only the serve.
 */
import { createServer } from "node:http";
import { handleSpekeRequest } from "./speke-handler.js";

const port = Number(process.env.PORT ?? 8080);

createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(405).end("Method Not Allowed");
    return;
  }
  const chunks: Buffer[] = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", async () => {
    const { status, contentType, body } = await handleSpekeRequest(Buffer.concat(chunks).toString("utf8"));
    res.writeHead(status, { "content-type": contentType }).end(body);
  });
}).listen(port, () => console.log(`SPEKE v2 (node) on http://localhost:${port}`));
