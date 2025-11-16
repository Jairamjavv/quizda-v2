import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// Type for Cloudflare Worker environment bindings
export interface Env {
  DB: D1Database;
  MY_BUCKET: R2Bucket;
}

// Initialize Drizzle with D1 database
export function getDb(env: Env) {
  return drizzle(env.DB, { schema });
}

// Export schema for use in other files
export * from "./schema";
