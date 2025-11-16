## ALLOWED_ORIGINS (CORS) — Quick setup

The worker uses an `ALLOWED_ORIGINS` allowlist to determine which origins are allowed
to access API endpoints (CORS). By default the worker allows:

`https://quizda-worker-prod.b-jairam0512.workers.dev`

Set `ALLOWED_ORIGINS` in your `wrangler.toml` or locally during development.

1. Set in `wrangler.toml` (per-environment):

```toml
[env.production]
vars = { ALLOWED_ORIGINS = "https://app.quizda.example.com,https://quizda-worker-prod.b-jairam0512.workers.dev" }

[env.dev]
vars = { ALLOWED_ORIGINS = "http://localhost:5173,https://quizda-worker-prod.b-jairam0512.workers.dev" }
```

2. Set locally (bash/zsh) before running the worker or building:

```bash
# allow local dev and the worker origin
export ALLOWED_ORIGINS="http://localhost:5173,https://quizda-worker-prod.b-jairam0512.workers.dev"

# then run the worker build or start your local server
cd server
npm run build:worker
# or to run the node bundle (after building):
PORT=4001 npm start
```

Notes

- Use a comma-separated list of allowed origins. The worker will echo the request `Origin`
  back when it's in the allowlist (recommended), otherwise it will fall back to the first
  configured allowed origin.
- For public demo deployments you can include `https://quizda-worker-prod.b-jairam0512.workers.dev`.
- For production, set the ALLOWED_ORIGINS to your frontend domain(s) to avoid exposing the API
  to arbitrary origins.

# Server — Quizda

A minimal Express server to host API endpoints used by the client.

Endpoints:

- GET /api/health — health status
- GET /api/quizzes — example list of quizzes

To run in server folder:

```bash
cd server
npm install
npm start
```
