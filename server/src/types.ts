// Environment Bindings available to Cloudflare Worker (Hono) handlers
/// <reference types="@cloudflare/workers-types" />

import type { SessionPayload } from "./utils/session";

export interface Env {
  DB: D1Database;
  MY_BUCKET: R2Bucket;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;
  // Optional: backend URL used by the worker to proxy auth requests
  BACKEND_URL?: string;
  ENVIRONMENT?: string;
  NODE_ENV?: string;
}

// Hono context variables
export type Variables = {
  session?: SessionPayload;
};

export default Env;
