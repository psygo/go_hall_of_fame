import { config } from "dotenv"
import { eq, sql } from "drizzle-orm"

import { createDatabase } from "../src/shared/database/data/database"
import {
  criteriaTable,
  gamePlayersTable,
  gamesTable,
  playersTable,
  timelineEventsTable,
} from "../src/shared/database/data/schema"
import { gameSeeds } from "./seed-data/games"
import { playerSeeds } from "./seed-data/players"
import {
  criteriaSeeds,
  timelineSeeds,
} from "./seed-data/timeline-and-criteria"

config({ path: ".env.local" })

const connectionString = process.env.DATABASE_URL
if (!connectionString)
  throw new Error("DATABASE_URL is not set")

const db = createDatabase(connectionString)

async function seedPlayers() {
  for (const player of playerSeeds) {
    await db
      .insert(playersTable)
      .values(player)
      .onConflictDoUpdate({
        target: playersTable.slug,
        set: player,
      })
  }
}

async function seedGames() {
  for (const { playerSlugs, ...game } of gameSeeds) {
    const [row] = await db
      .insert(gamesTable)
      .values(game)
      .onConflictDoUpdate({
        target: gamesTable.slug,
        set: game,
      })
      .returning({ id: gamesTable.id })
    await linkGameToPlayers(row.id, playerSlugs)
  }
}

async function linkGameToPlayers(
  gameId: number,
  playerSlugs: readonly string[],
) {
  await db
    .delete(gamePlayersTable)
    .where(eq(gamePlayersTable.gameId, gameId))
  for (const slug of playerSlugs) {
    const [player] = await db
      .select({ id: playersTable.id })
      .from(playersTable)
      .where(eq(playersTable.slug, slug))
    if (player === undefined) {
      throw new Error(
        `Seed game links to unknown player "${slug}"`,
      )
    }
    await db
      .insert(gamePlayersTable)
      .values({ gameId, playerId: player.id })
  }
}

async function seedTimelineAndCriteria() {
  await db.delete(timelineEventsTable)
  await db.insert(timelineEventsTable).values(
    timelineSeeds.map((seed, position) => ({
      ...seed,
      position,
    })),
  )
  for (const criterion of criteriaSeeds) {
    await db
      .insert(criteriaTable)
      .values(criterion)
      .onConflictDoUpdate({
        target: criteriaTable.position,
        set: criterion,
      })
  }
}

async function main() {
  await seedPlayers()
  await seedGames()
  await seedTimelineAndCriteria()
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(playersTable)
  console.log(`Seeded. Players in the Hall: ${count}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => process.exit())
