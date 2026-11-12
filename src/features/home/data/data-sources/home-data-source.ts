import { asc, desc, max, min, sql } from "drizzle-orm"

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
      featuredGame,
      featuredPlayer,
    ] = await Promise.all([
      this.countRows(playersTable),
      this.countRows(gamesTable),
      this.fetchTimelineSpan(),
      this.fetchFeaturedGame(),
      this.fetchFeaturedPlayer(),
    ])
    return HomeFactsModel.fromRawData({
      playerCount,
      gameCount,
      ...span,
      featuredGame,
      featuredPlayer,
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

  private async fetchFeaturedGame() {
    const [row] = await this.database
      .select()
      .from(gamesTable)
      .orderBy(
        desc(gamesTable.featured),
        asc(gamesTable.year),
        asc(gamesTable.sequence),
        asc(gamesTable.id),
      )
      .limit(1)
    return row ?? null
  }

  private async fetchFeaturedPlayer() {
    const [row] = await this.database
      .select()
      .from(playersTable)
      .orderBy(
        desc(playersTable.featured),
        asc(playersTable.inductionNumber),
      )
      .limit(1)
    return row ?? null
  }
}
