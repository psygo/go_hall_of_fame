import { asc, eq } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import {
  gamePlayersTable,
  gamesTable,
  playersTable,
} from "@/shared/database/data/schema"

import type { PlayerDraft } from "../../domain/entities/player-draft"
import {
  PlayerDetailModel,
  PlayerModel,
} from "../models/player-model"

export class PlayersDataSource {
  constructor(private readonly database: Database) {}

  async fetchAll(): Promise<PlayerModel[]> {
    const rows = await this.database
      .select()
      .from(playersTable)
      .orderBy(asc(playersTable.inductionNumber))
    return rows.map((row) => PlayerModel.fromRawData(row))
  }

  async fetchDetailBySlug(
    slug: string,
  ): Promise<PlayerDetailModel | null> {
    const [row] = await this.database
      .select()
      .from(playersTable)
      .where(eq(playersTable.slug, slug))
    if (row === undefined) return null
    const games = await this.fetchGameReferences(row.id)
    return PlayerDetailModel.fromRawData({ ...row, games })
  }

  private fetchGameReferences(playerId: number) {
    return this.database
      .select({
        slug: gamesTable.slug,
        year: gamesTable.year,
        name: gamesTable.name,
      })
      .from(gamePlayersTable)
      .innerJoin(
        gamesTable,
        eq(gamePlayersTable.gameId, gamesTable.id),
      )
      .where(eq(gamePlayersTable.playerId, playerId))
      .orderBy(
        asc(gamesTable.year),
        asc(gamesTable.sequence),
        asc(gamesTable.id),
      )
  }

  async upsert(
    draft: PlayerDraft,
    originalSlug: string | null,
  ): Promise<void> {
    await this.database.transaction(async (tx) => {
      if (draft.featured) {
        await tx
          .update(playersTable)
          .set({ featured: false })
      }
      if (originalSlug === null) {
        await tx.insert(playersTable).values(draft)
        return
      }
      await tx
        .update(playersTable)
        .set(draft)
        .where(eq(playersTable.slug, originalSlug))
    })
  }

  async deleteBySlug(slug: string): Promise<void> {
    await this.database
      .delete(playersTable)
      .where(eq(playersTable.slug, slug))
  }
}
