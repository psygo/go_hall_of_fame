import {
  drizzle,
  type NodePgDatabase,
} from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "./schema"

export type Database = NodePgDatabase<typeof schema>

export function createDatabase(
  connectionString: string,
): Database {
  const pool = new Pool({ connectionString })
  // An idle client that loses its connection emits "error"; unhandled, it would crash the process.
  pool.on("error", (error) => {
    console.error(
      "Unexpected error on an idle database client",
      error,
    )
  })
  return drizzle(pool, { schema })
}
