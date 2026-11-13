import "server-only"

import {
  createDatabase,
  readConnectionString,
  type Database,
} from "@/shared/database/data/database"

declare global {
  // Reused across hot reloads in development so the pool is not recreated on every edit.
  var goHallOfFameDatabase: Database | undefined
}

function connect(): Database {
  const connectionString = readConnectionString(process.env)
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL (or POSTGRES_URL) is not set. See docs/deployment.md.",
    )
  }
  return createDatabase(connectionString)
}

export const database: Database =
  (globalThis.goHallOfFameDatabase ??= connect())
