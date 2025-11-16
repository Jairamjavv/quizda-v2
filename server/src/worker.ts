import { Hono } from "hono";
import openapi from "../openapi.json";
import type { Env } from "./types";
import workerAuth from "./worker-auth";

// Create a Hono app for Cloudflare Worker / ESM builds (worker-only)
const app = new Hono<{ Bindings: Env }>();

// CORS middleware for Worker routes: honor configured allowed origins
const defaultAllowed = [
  "https://quizda-worker-prod.b-jairam0512.workers.dev",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://quizda.vercel.app",
];

app.use("*", async (c, next) => {
  await next();
  // Read allowed origins from worker bindings when available, fallback to defaults
  const allowedOriginsEnv = (c.env as any)?.ALLOWED_ORIGINS
    ? String((c.env as any).ALLOWED_ORIGINS)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;
  const allowedOrigins =
    allowedOriginsEnv && allowedOriginsEnv.length
      ? allowedOriginsEnv
      : defaultAllowed;

  const origin = c.req.header("origin");
  const allow =
    origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  if (allow) {
    c.header("Access-Control-Allow-Origin", allow);
    c.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
});

// Respond to preflight requests
app.options("*", (c) => {
  // Compute allowed origins from bindings just like the middleware
  const allowedOriginsEnv = (c.env as any)?.ALLOWED_ORIGINS
    ? String((c.env as any).ALLOWED_ORIGINS)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;
  const allowedOrigins =
    allowedOriginsEnv && allowedOriginsEnv.length
      ? allowedOriginsEnv
      : defaultAllowed;

  const origin = c.req.header("origin");
  const allow =
    origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  if (allow) headers["Access-Control-Allow-Origin"] = allow;
  return new Response(null, { status: 204, headers });
});

app.get("/api/health", (c) =>
  c.json({ status: "ok", name: "Quizda API (Worker)" })
);

// /api/hello
app.get("/api/hello", (c) =>
  c.json({ message: "Hello from Cloudflare Worker" }, 200)
);

// /api/quizzes - placeholder until D1+R2 read is implemented
app.get("/api/quizzes", (c) => {
  return c.json([]);
});

// Mount auth routes (handles register, login, me)
app.route("/api", workerAuth);

// OpenAPI and docs
app.get("/api/openapi.json", (c) => c.json(openapi));
app.get("/api/docs", (c) => {
  const html = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Quizda API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
    <script>
      window.addEventListener('load', async () => {
        try {
          const resp = await fetch('/api/openapi.json');
          const spec = await resp.json();
          spec.servers = [{ url: window.location.origin }];
          SwaggerUIBundle({ spec: spec, dom_id: '#swagger-ui', validatorUrl: null });
        } catch (err) {
          document.getElementById('swagger-ui').innerText = 'Failed to load API docs: ' + String(err);
        }
      });
    </script>
  </body>
  </html>`;
  return c.html(html);
});

export default {
  async fetch(request: Request, env?: any, ctx?: any) {
    try {
      return await app.fetch(request, env);
    } catch (err: any) {
      const body = {
        error: String(err),
        stack: err?.stack ? String(err.stack) : undefined,
      };
      return new Response(JSON.stringify(body), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
