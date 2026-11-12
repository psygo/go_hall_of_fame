import { asc, eq } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import {
  gamePlayersTable,
  gamesTable,
  playersTable,
} from "@/shared/database/data/schema"

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
}
