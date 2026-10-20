import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.cwd(), "out");
const port = Number(process.env.PORT ?? 3000);

const contentTypes: Readonly<Record<string, string>> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function safePath(requestUrl: string): string | null {
  try {
    const pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
    const relativePath = pathname.replace(/^\/+/, "") || "index.html";
    const candidate = path.resolve(root, relativePath);
    if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
      return null;
    }
    return candidate;
  } catch {
    return null;
  }
}

async function resolveFile(candidate: string): Promise<string | null> {
  const candidates = [
    candidate,
    path.join(candidate, "index.html"),
    candidate.endsWith(path.sep) ? path.join(candidate, "index.html") : `${candidate}.html`,
  ];

  for (const file of candidates) {
    try {
      const fileStats = await stat(file);
      if (fileStats.isFile()) {
        return file;
      }
    } catch {
      // Try the next static-export fallback.
    }
  }

  return null;
}

async function sendFile(
  file: string,
  request: IncomingMessage,
  response: ServerResponse,
  statusCode: number,
): Promise<void> {
  const extension = path.extname(file).toLowerCase();
  response.writeHead(statusCode, {
    "Cache-Control": "no-cache",
    "Content-Type": contentTypes[extension] ?? "application/octet-stream",
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  createReadStream(file).pipe(response);
}

async function handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  const candidate = safePath(request.url ?? "/");
  if (candidate === null) {
    response.writeHead(400);
    response.end("Bad request");
    return;
  }

  const file = await resolveFile(candidate);
  if (file === null) {
    const notFoundFile = path.join(root, "404.html");
    if (await resolveFile(notFoundFile) === null) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    await sendFile(notFoundFile, request, response, 404);
    return;
  }

  await sendFile(file, request, response, 200);
}

await access(root);
const server = createServer((request, response) => {
  void handle(request, response).catch(() => {
    if (!response.headersSent) {
      response.writeHead(500);
    }
    response.end("Internal server error");
  });
});

server.listen(port, () => {
  console.log(`Static export available at http://localhost:${port}`);
});
