import { alias } from "drizzle-orm/pg-core"
import { asc, eq, inArray, sql } from "drizzle-orm"

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

import type { GameDraft } from "../../domain/entities/game-draft"
import {
  GameDetailModel,
  GameModel,
} from "../models/game-model"

const blackPlayer = alias(playersTable, "black_player")
const whitePlayer = alias(playersTable, "white_player")

/** Every column but the SGF text, which can be large: lists only learn whether one was uploaded. */
const gameSelection = {
  id: gamesTable.id,
  slug: gamesTable.slug,
  year: gamesTable.year,
  name: gamesTable.name,
  black: gamesTable.black,
  white: gamesTable.white,
  blackPlayerSlug: blackPlayer.slug,
  whitePlayerSlug: whitePlayer.slug,
  result: gamesTable.result,
  setting: gamesTable.setting,
  description: gamesTable.description,
  sgfUrl: gamesTable.sgfUrl,
  highlightMove: gamesTable.highlightMove,
  hasUploadedSgf: sql<boolean>`${gamesTable.sgfText} is not null`,
  sequence: gamesTable.sequence,
  featured: gamesTable.featured,
}

export class GamesDataSource {
  constructor(private readonly database: Database) {}

  async fetchAll(): Promise<GameModel[]> {
    const rows = await this.database
      .select(gameSelection)
      .from(gamesTable)
      .leftJoin(
        blackPlayer,
        eq(gamesTable.blackPlayerId, blackPlayer.id),
      )
      .leftJoin(
        whitePlayer,
        eq(gamesTable.whitePlayerId, whitePlayer.id),
      )
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
      .select(gameSelection)
      .from(gamesTable)
      .leftJoin(
        blackPlayer,
        eq(gamesTable.blackPlayerId, blackPlayer.id),
      )
      .leftJoin(
        whitePlayer,
        eq(gamesTable.whitePlayerId, whitePlayer.id),
      )
      .where(eq(gamesTable.slug, slug))
    if (row === undefined) return null
    const players = await this.fetchPlayerReferences(row.id)
    const resources = await selectResources(this.database, {
      kind: "game",
      id: row.id,
    })
    return GameDetailModel.fromRawData({
      ...row,
      players,
      resources,
    })
  }

  async fetchSgfTextBySlug(
    slug: string,
  ): Promise<string | null> {
    const [row] = await this.database
      .select({ sgfText: gamesTable.sgfText })
      .from(gamesTable)
      .where(eq(gamesTable.slug, slug))
    return row?.sgfText ?? null
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
    await this.database.transaction(async (tx) => {
      if (draft.featured) {
        await tx.update(gamesTable).set({ featured: false })
      }
      const linked =
        draft.playerSlugs.length === 0
          ? []
          : await tx
              .select({
                id: playersTable.id,
                slug: playersTable.slug,
              })
              .from(playersTable)
              .where(
                inArray(playersTable.slug, [
                  ...draft.playerSlugs,
                ]),
              )
      const idOf = (slug: string | null) =>
        linked.find((player) => player.slug === slug)?.id ??
        null
      const fields = {
        slug: draft.slug,
        year: draft.year,
        name: draft.name,
        black: draft.black,
        white: draft.white,
        blackPlayerId: idOf(draft.blackPlayerSlug),
        whitePlayerId: idOf(draft.whitePlayerSlug),
        result: draft.result,
        setting: draft.setting,
        description: draft.description,
        sgfUrl: draft.sgfUrl,
        highlightMove: draft.highlightMove,
        sequence: draft.sequence,
        featured: draft.featured,
        ...sgfColumn(draft),
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
      if (linked.length > 0) {
        await tx.insert(gamePlayersTable).values(
          linked.map((player) => ({
            gameId: row.id,
            playerId: player.id,
          })),
        )
      }
      await replaceResources(
        tx,
        { kind: "game", id: row.id },
        draft.resources,
      )
    })
  }

  async deleteBySlug(slug: string): Promise<void> {
    await this.database
      .delete(gamesTable)
      .where(eq(gamesTable.slug, slug))
  }
}

/** The SGF text column to write, or nothing when the stored text stays. */
function sgfColumn(draft: GameDraft) {
  if (draft.sgf.kind === "keep") return {}
  return {
    sgfText:
      draft.sgf.kind === "replace" ? draft.sgf.text : null,
  }
}
