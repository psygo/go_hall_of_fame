import { alias } from "drizzle-orm/pg-core"
import { eq, max, min, sql } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import {
  gamesTable,
  playersTable,
  timelineEventsTable,
} from "@/shared/database/data/schema"

import { HomeFactsModel } from "../models/home-facts-model"

export class HomeDataSource {
  constructor(private readonly database: Database) {}

  async fetchFacts(): Promise<HomeFactsModel> {
    const [
      playerCount,
      gameCount,
      span,
      spotlightGame,
      spotlightPlayer,
    ] = await Promise.all([
      this.countRows(playersTable),
      this.countRows(gamesTable),
      this.fetchTimelineSpan(),
      this.fetchSpotlightGame(),
      this.fetchSpotlightPlayer(),
    ])
    return HomeFactsModel.fromRawData({
      playerCount,
      gameCount,
      ...span,
      spotlightGame,
      spotlightPlayer,
    })
  }

  private async countRows(
    table: typeof playersTable | typeof gamesTable,
  ): Promise<number> {
    const [row] = await this.database
      .select({ count: sql<number>`count(*)::int` })
      .from(table)
    return row.count
  }

  private async fetchTimelineSpan() {
    const [row] = await this.database
      .select({
        firstYear: min(timelineEventsTable.year),
        lastYear: max(timelineEventsTable.year),
      })
      .from(timelineEventsTable)
    return row
  }

  /** A different game on every visit. The SGF text itself is never read, only whether there is one. */
  private async fetchSpotlightGame() {
    const blackPlayer = alias(playersTable, "black_player")
    const whitePlayer = alias(playersTable, "white_player")
    const [row] = await this.database
      .select({
        slug: gamesTable.slug,
        name: gamesTable.name,
        year: gamesTable.year,
        black: gamesTable.black,
        white: gamesTable.white,
        blackPlayerSlug: blackPlayer.slug,
        whitePlayerSlug: whitePlayer.slug,
        result: gamesTable.result,
        description: gamesTable.description,
        tags: gamesTable.tags,
        sgfUrl: gamesTable.sgfUrl,
        hasUploadedSgf: sql<boolean>`${gamesTable.sgfText} is not null`,
        highlightMove: gamesTable.highlightMove,
      })
      .from(gamesTable)
      .leftJoin(
        blackPlayer,
        eq(gamesTable.blackPlayerId, blackPlayer.id),
      )
      .leftJoin(
        whitePlayer,
        eq(gamesTable.whitePlayerId, whitePlayer.id),
      )
      .orderBy(sql`random()`)
      .limit(1)
    return row ?? null
  }

  private async fetchSpotlightPlayer() {
    const [row] = await this.database
      .select()
      .from(playersTable)
      .orderBy(sql`random()`)
      .limit(1)
    return row ?? null
  }
}
