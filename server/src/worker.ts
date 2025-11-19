import { Hono } from "hono";
import openapi from "../openapi.json";
import type { Env, Variables } from "./types";
import {
  authRoutes,
  quizRoutes,
  attemptRoutes,
  csrfRoutes,
  categoryRoutes,
} from "./routes";
import {
  securityHeaders,
  rateLimitMiddleware,
  csrfProtection,
} from "./middleware/security";
import { requireAuth } from "./middleware/auth";
import { AuthController } from "./controllers/AuthController";

// Create a Hono app for Cloudflare Worker / ESM builds (worker-only)
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORS middleware for Worker routes: honor configured allowed origins
const defaultAllowed = [
  "https://quizda-worker-prod.b-jairam0512.workers.dev",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://quizda-v2-client.pages.dev", // Cloudflare Pages production
];

// Function to check if origin is allowed (supports wildcards for preview URLs)
function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  // Check exact matches
  if (allowedOrigins.includes(origin)) return true;

  // Allow all Cloudflare Pages preview URLs (*.quizda-v2-client.pages.dev)
  if (origin.endsWith(".quizda-v2-client.pages.dev")) return true;

  return false;
}

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
  // Check if origin is allowed (including wildcard matches)
  const isAllowed = origin && isOriginAllowed(origin, allowedOrigins);
  const allow = isAllowed ? origin : null;
  if (allow) {
    c.header("Access-Control-Allow-Origin", allow);
    c.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    c.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-CSRF-Token"
    );
    c.header("Access-Control-Allow-Credentials", "true"); // Required for cookies
  }
});

// Security middleware
app.use("*", securityHeaders);
app.use("*", rateLimitMiddleware);
app.use("*", csrfProtection);

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
  const isAllowed = origin && isOriginAllowed(origin, allowedOrigins);
  const allow = isAllowed ? origin : null;
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
  };
  if (allow) {
    headers["Access-Control-Allow-Origin"] = allow;
    headers["Access-Control-Allow-Credentials"] = "true"; // Required for cookies
  }
  return new Response(null, { status: 204, headers });
});

app.get("/api/health", (c) =>
  c.json({ status: "ok", name: "Quizda API (Worker)" })
);

// /api/hello
app.get("/api/hello", (c) =>
  c.json({ message: "Hello from Cloudflare Worker" }, 200)
);

// Mount route modules
app.route("/api/auth", authRoutes); // Auth routes: /api/auth/register, /api/auth/login, etc.
app.route("/api/quizzes", quizRoutes); // Quiz routes: /api/quizzes, /api/quizzes/:id, etc.
app.route("/api/attempts", attemptRoutes); // Attempt routes: /api/attempts, /api/attempts/user/:userId, etc.
app.route("/api/csrf", csrfRoutes); // CSRF routes: /api/csrf/token
app.route("/api/categories", categoryRoutes); // Category routes: /api/categories

// Backward compatibility: Keep old auth routes at /api/ level
app.post("/api/register", (c) => AuthController.register(c));
app.post("/api/login", (c) => AuthController.login(c));
app.get("/api/me", requireAuth, (c) => AuthController.getMe(c));
app.post("/api/logout", requireAuth, (c) => AuthController.logout(c));
app.post("/api/refresh", (c) => AuthController.refreshToken(c));

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
