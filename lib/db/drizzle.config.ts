import { defineConfig } from "drizzle-kit";
import path from "path";
import dotenv from "dotenv";

// Load the repo-root .env so `pnpm --filter @workspace/db run push` picks up
// DATABASE_URL without needing it set in the shell.
dotenv.config({ path: path.join(__dirname, "../../.env") });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and set your Postgres connection string.",
  );
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
