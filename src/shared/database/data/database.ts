import {
  drizzle,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import { withExplicitSslMode } from "./connection-string"
import * as schema from "./schema"

export type Database = NodePgDatabase<typeof schema>

/** The URL the app connects to: DATABASE_URL, or POSTGRES_URL (set by Vercel's Postgres integrations). */
export function readConnectionString(
  env: Readonly<Record<string, string | undefined>>,
): string | null {
  return env.DATABASE_URL || env.POSTGRES_URL || null
}

export function createDatabase(
  connectionString: string,
): Database {
  // A small pool: on serverless every instance has its own, and the database caps connections.
  const pool = new Pool({
    connectionString: withExplicitSslMode(connectionString),
    max: 5,
  })
  // An idle client that loses its connection emits "error"; unhandled, it would crash the process.
  pool.on("error", (error) => {
    console.error(
      "Unexpected error on an idle database client:",
      error.name,
    )
  })
  return drizzle(pool, { schema })
}
