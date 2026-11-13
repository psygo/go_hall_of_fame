import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env.local" })

export default defineConfig({
  out: "./drizzle",
  schema: "./src/shared/database/data/schema.ts",
  dialect: "postgresql",
  // Migrations use a direct (unpooled) connection when the host provides one.
  dbCredentials: {
    url:
      process.env.DATABASE_URL_UNPOOLED ??
      process.env.DATABASE_URL ??
      process.env.POSTGRES_URL ??
      "",
  },
})
