import { Hono } from "hono";
import openapi from "../openapi.json";
import { initializeFirebase } from "./services/firebase";
import auth from "./routes/auth";
import type { Env } from "./types";

// Create a Hono app for Cloudflare Worker / ESM builds
const app = new Hono<{ Bindings: Env }>();

// CORS middleware for Worker routes: honor configured allowed origins
// Set `ALLOWED_ORIGINS` (comma-separated) in your wrangler or environment to restrict origins.
const defaultAllowed = [
  "https://quizda-worker-prod.b-jairam0512.workers.dev",
  "http://localhost:5173", // Local Vite dev server
  "http://localhost:3000", // Alternative local port
  "https://quizda-v2-client.pages.dev", // Cloudflare Pages production
  "https://b1c9c6a2.quizda-v2-client.pages.dev", // Cloudflare Pages preview
];
const allowedOriginsEnv =
  typeof process !== "undefined" && process.env && process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;
const allowedOrigins =
  allowedOriginsEnv && allowedOriginsEnv.length
    ? allowedOriginsEnv
    : defaultAllowed;

app.use("*", async (c, next) => {
  await next();
  const origin = c.req.header("origin");
  // If the request Origin is in the allowlist, echo it. Otherwise, fall back to the first allowed origin.
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

// Initialize Firebase on first request
app.use("*", async (c, next) => {
  initializeFirebase(c.env);
  await next();
});

// Mount auth routes
app.route("/api", auth);

app.get("/api/health", (c) => c.json({ status: "ok", name: "Quizda API" }));

app.get("/api/hello", (c) =>
  c.json({ message: "Hello from Cloudflare Worker" }, 200)
);

app.get("/api/quizzes", (c) => {
  // Removed mock/sample quiz generation. This endpoint currently
  // returns an empty list while real quiz storage (D1 + R2) is used.
  // Clients should fetch quizzes from the API backed by D1/R2 once implemented.
  return c.json([]);
});

// Legacy auth endpoints removed. Clients should use the Firebase-backed
// endpoints mounted at `/api` (register, login, me).
app.post("/api/register", async (c) => {
  return c.json(
    { error: "Legacy register endpoint removed. Use /api/register" },
    501
  );
});

app.post("/api/login", async (c) => {
  return c.json(
    { error: "Legacy login endpoint removed. Use /api/login" },
    501
  );
});

app.post("/api/forgot-password", async (c) => {
  return c.json(
    {
      error:
        "Legacy forgot-password endpoint removed. Use password reset via Firebase Console or implement a secure flow.",
    },
    501
  );
});

// Serve OpenAPI JSON for Swagger UI
app.get("/api/openapi.json", (c) => c.json(openapi));

// Serve a minimal Swagger UI page (uses swagger-ui-dist from CDN)
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
      // Fetch the OpenAPI JSON, override servers to the current origin,
      // and initialize Swagger UI with the modified spec so Try-It-Out
      // targets the worker origin instead of localhost.
      window.addEventListener('load', async () => {
        try {
          const resp = await fetch('/api/openapi.json');
          const spec = await resp.json();
          // Replace servers so the UI uses the current origin
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

// Export a fetch handler for workers — accept env so routes can access bindings (e.g., BACKEND_URL)
export default {
  async fetch(request: Request, env?: any, ctx?: any) {
    // Pass env through to Hono so handlers read `c.env`
    return app.fetch(request, env);
  },
};

// Note: Node/Express dev server is provided separately in `server/index.js`.
// This Worker-only entrypoint should not include Node-only code to keep the
// worker bundle small and avoid bundler warnings.
