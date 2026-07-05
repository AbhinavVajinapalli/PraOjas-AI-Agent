import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load .env so drizzle-kit CLI can read credentials when run standalone
dotenv.config();

const sqlHost = process.env.SQL_HOST || "";
const sqlDbName = process.env.SQL_DB_NAME || "";
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER || "";
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD || "";

/**
 * Drizzle Kit configuration.
 *
 * NOTE: This file is used ONLY by the `drizzle-kit` CLI for migrations:
 *   npx drizzle-kit generate
 *   npx drizzle-kit migrate
 *   npx drizzle-kit studio
 *
 * It is NOT imported during normal server startup (`npm run dev`).
 * DB credentials are validated at CLI runtime, not at import time.
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    host: sqlHost,
    user: user,
    password: password,
    database: sqlDbName,
    ssl: false,
  },
  verbose: true,
});
