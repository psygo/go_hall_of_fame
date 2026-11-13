import { and, asc, desc, eq } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import {
  replaceResources,
  selectResources,
} from "@/shared/database/data/resources"
import {
  gamePlayersTable,
  gamesTable,
  playersTable,
} from "@/shared/database/data/schema"

import { isVisible } from "@/shared/database/data/drafts"

import type { PlayerDraft } from "../../domain/entities/player-draft"
import {
  PlayerDetailModel,
  PlayerModel,
} from "../models/player-model"

export class PlayersDataSource {
  constructor(private readonly database: Database) {}

  async fetchAll(
    includeDrafts: boolean,
  ): Promise<PlayerModel[]> {
    const rows = await this.database
      .select()
      .from(playersTable)
      .where(isVisible(playersTable, includeDrafts))
      .orderBy(
        desc(playersTable.birthYear),
        asc(playersTable.inductionNumber),
      )
    return rows.map((row) => PlayerModel.fromRawData(row))
  }

  async fetchDetailBySlug(
    slug: string,
    includeDrafts: boolean,
  ): Promise<PlayerDetailModel | null> {
    const [row] = await this.database
      .select()
      .from(playersTable)
      .where(
        and(
          eq(playersTable.slug, slug),
          isVisible(playersTable, includeDrafts),
        ),
      )
    if (row === undefined) return null
    const games = await this.fetchGameReferences(
      row.id,
      includeDrafts,
    )
    const resources = await selectResources(this.database, {
      kind: "player",
      id: row.id,
    })
    return PlayerDetailModel.fromRawData({
      ...row,
      games,
      resources,
    })
  }

  private fetchGameReferences(
    playerId: number,
    includeDrafts: boolean,
  ) {
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
      .where(
        and(
          eq(gamePlayersTable.playerId, playerId),
          isVisible(gamesTable, includeDrafts),
        ),
      )
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
    const { resources, tags, ...rest } = draft
    const fields = { ...rest, tags: [...tags] }
    await this.database.transaction(async (tx) => {
      const [row] =
        originalSlug === null
          ? await tx
              .insert(playersTable)
              .values(fields)
              .returning({ id: playersTable.id })
          : await tx
              .update(playersTable)
              .set(fields)
              .where(eq(playersTable.slug, originalSlug))
              .returning({ id: playersTable.id })
      if (row === undefined)
        throw new Error(
          "The player to update was not found",
        )
      await replaceResources(
        tx,
        { kind: "player", id: row.id },
        resources,
      )
    })
  }

  async deleteBySlug(slug: string): Promise<void> {
    await this.database
      .delete(playersTable)
      .where(eq(playersTable.slug, slug))
  }
}
