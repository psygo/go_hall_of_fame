import { alias } from "drizzle-orm/pg-core"
import { and, eq, sql } from "drizzle-orm"

import { isVisible } from "@/shared/database/data/drafts"
import type { Database } from "@/shared/database/data/database"
import {
  gamesTable,
  playersTable,
  timelineEventsTable,
} from "@/shared/database/data/schema"

import { HomeFactsModel } from "../models/home-facts-model"

const yearNumber = sql<
  number | null
>`nullif(substring(${timelineEventsTable.year} from '[0-9]{3,4}'), '')::int`

/** The smallest or largest year, read as a number (drizzle would hand back text for min/max of an expression). */
function yearBound(bound: "min" | "max") {
  return sql<
    number | null
  >`${sql.raw(bound)}(${yearNumber})`.mapWith((value) =>
    value === null ? null : Number(value),
  )
}

export class HomeDataSource {
  constructor(private readonly database: Database) {}

  async fetchFacts(
    includeDrafts: boolean,
  ): Promise<HomeFactsModel> {
    const [
      playerCount,
      gameCount,
      span,
      spotlightGame,
      spotlightPlayer,
    ] = await Promise.all([
      this.countRows(playersTable, includeDrafts),
      this.countRows(gamesTable, includeDrafts),
      this.fetchTimelineSpan(includeDrafts),
      this.fetchSpotlightGame(includeDrafts),
      this.fetchSpotlightPlayer(includeDrafts),
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
    includeDrafts: boolean,
  ): Promise<number> {
    const [row] = await this.database
      .select({ count: sql<number>`count(*)::int` })
      .from(table)
      .where(isVisible(table, includeDrafts))
    return row.count
  }

  private async fetchTimelineSpan(includeDrafts: boolean) {
    const [row] = await this.database
      .select({
        // The years are text now: use the first 3-4 digit number of each ("c. 1670" gives 1670).
        firstYear: yearBound("min"),
        lastYear: yearBound("max"),
      })
      .from(timelineEventsTable)
      .where(isVisible(timelineEventsTable, includeDrafts))
    return row
  }

  /** A different game on every visit. The SGF text itself is never read, only whether there is one. */
  private async fetchSpotlightGame(includeDrafts: boolean) {
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
        and(
          eq(gamesTable.blackPlayerId, blackPlayer.id),
          isVisible(blackPlayer, includeDrafts),
        ),
      )
      .leftJoin(
        whitePlayer,
        and(
          eq(gamesTable.whitePlayerId, whitePlayer.id),
          isVisible(whitePlayer, includeDrafts),
        ),
      )
      .where(isVisible(gamesTable, includeDrafts))
      .orderBy(sql`random()`)
      .limit(1)
    return row ?? null
  }

  private async fetchSpotlightPlayer(
    includeDrafts: boolean,
  ) {
    const [row] = await this.database
      .select()
      .from(playersTable)
      .where(isVisible(playersTable, includeDrafts))
      .orderBy(sql`random()`)
      .limit(1)
    return row ?? null
  }
}
