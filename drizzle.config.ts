import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js keeps secrets in .env.local; drizzle-kit only auto-loads .env.
loadEnv({ path: ".env.local" });
loadEnv();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./src/core/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
