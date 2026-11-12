import "server-only"

import {
  createDatabase,
  type Database,
} from "@/shared/database/data/database"

declare global {
  // Reused across hot reloads in development so the pool is not recreated on every edit.
  var goHallOfFameDatabase: Database | undefined
}

function connect(): Database {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local.",
    )
  }
  return createDatabase(connectionString)
}

export const database: Database =
  (globalThis.goHallOfFameDatabase ??= connect())
