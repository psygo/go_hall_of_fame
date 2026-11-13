import { asc, eq, inArray } from "drizzle-orm"
import type { GameDraft } from "../../domain/entities/game-draft"

import type { Database } from "@/shared/database/data/database"
import {
  gamePlayersTable,
  gamesTable,
  playersTable,
} from "@/shared/database/data/schema"

import {
  GameDetailModel,
  GameModel,
} from "../models/game-model"

export class GamesDataSource {
  constructor(private readonly database: Database) {}

  async fetchAll(): Promise<GameModel[]> {
    const rows = await this.database
      .select()
      .from(gamesTable)
      .orderBy(
        asc(gamesTable.year),
        asc(gamesTable.sequence),
        asc(gamesTable.id),
      )
    return rows.map((row) => GameModel.fromRawData(row))
  }

  async fetchDetailBySlug(
    slug: string,
  ): Promise<GameDetailModel | null> {
    const [row] = await this.database
      .select()
      .from(gamesTable)
      .where(eq(gamesTable.slug, slug))
    if (row === undefined) return null
    const players = await this.fetchPlayerReferences(row.id)
    return GameDetailModel.fromRawData({ ...row, players })
  }

  private fetchPlayerReferences(gameId: number) {
    return this.database
      .select({
        slug: playersTable.slug,
        name: playersTable.name,
      })
      .from(gamePlayersTable)
      .innerJoin(
        playersTable,
        eq(gamePlayersTable.playerId, playersTable.id),
      )
      .where(eq(gamePlayersTable.gameId, gameId))
      .orderBy(asc(playersTable.inductionNumber))
  }

  listPlayerOptions() {
    return this.database
      .select({
        slug: playersTable.slug,
        name: playersTable.name,
      })
      .from(playersTable)
      .orderBy(asc(playersTable.inductionNumber))
  }

  async upsert(
    draft: GameDraft,
    originalSlug: string | null,
  ): Promise<void> {
    const { playerSlugs, ...fields } = draft
    await this.database.transaction(async (tx) => {
      if (draft.featured) {
        await tx.update(gamesTable).set({ featured: false })
      }
      const [row] =
        originalSlug === null
          ? await tx
              .insert(gamesTable)
              .values(fields)
              .returning({ id: gamesTable.id })
          : await tx
              .update(gamesTable)
              .set(fields)
              .where(eq(gamesTable.slug, originalSlug))
              .returning({ id: gamesTable.id })
      if (row === undefined)
        throw new Error("The game to update was not found")
      await tx
        .delete(gamePlayersTable)
        .where(eq(gamePlayersTable.gameId, row.id))
      if (playerSlugs.length === 0) return
      const players = await tx
        .select({ id: playersTable.id })
        .from(playersTable)
        .where(inArray(playersTable.slug, [...playerSlugs]))
      await tx.insert(gamePlayersTable).values(
        players.map((player) => ({
          gameId: row.id,
          playerId: player.id,
        })),
      )
    })
  }

  async deleteBySlug(slug: string): Promise<void> {
    await this.database
      .delete(gamesTable)
      .where(eq(gamesTable.slug, slug))
  }
}
