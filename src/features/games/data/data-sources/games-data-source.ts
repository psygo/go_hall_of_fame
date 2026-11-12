import { asc, eq } from "drizzle-orm"

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
}
