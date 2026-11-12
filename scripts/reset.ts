import { config } from "dotenv"
import { sql } from "drizzle-orm"

import { createDatabase } from "../src/shared/database/data/database"

config({ path: ".env.local" })

const connectionString = process.env.DATABASE_URL
if (!connectionString)
  throw new Error("DATABASE_URL is not set")

const LOCAL_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]",
])

function isLocalDatabase(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      LOCAL_HOSTS.has(parsed.hostname) &&
      !parsed.searchParams.has("host")
    )
  } catch {
    // The message must not echo the URL: it contains the password.
    return false
  }
}

if (!isLocalDatabase(connectionString)) {
  throw new Error(
    "Refusing to empty a database that is not clearly on localhost.",
  )
}

createDatabase(connectionString)
  .execute(
    sql`truncate game_players, games, players, timeline_events, criteria, nominations restart identity cascade`,
  )
  .then(() =>
    console.log("Tables emptied. Run pnpm db:seed."),
  )
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => process.exit())
