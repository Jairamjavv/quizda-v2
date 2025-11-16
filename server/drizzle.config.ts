import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.R2_ACCOUNT_ID!,
    databaseId: process.env.D1_DATABASE_URL!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
});
