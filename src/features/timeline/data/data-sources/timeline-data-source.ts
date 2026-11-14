import {
  and,
  asc,
  eq,
  inArray,
  max,
  sql,
} from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import { isVisible } from "@/shared/database/data/drafts"
import {
  contributorsTable,
  gamesTable,
  playersTable,
  timelineEventContributorsTable,
  timelineEventGamesTable,
  timelineEventPlayersTable,
  timelineEventsTable,
} from "@/shared/database/data/schema"

import type { TimelineEventDraft } from "../../domain/entities/timeline-event-draft"
import { TimelineEventModel } from "../models/timeline-event-model"

type LinkRow = {
  readonly eventId: number
  readonly slug: string
  readonly name: string
}

type ContributorLinkRow = LinkRow & {
  readonly kind: string
  readonly photoUrl: string | null
  readonly photoPosition: string
}

type PlayerLinkRow = LinkRow & {
  readonly photoUrl: string | null
  readonly photoPosition: string
}

type GameLinkRow = LinkRow & {
  readonly sgfUrl: string | null
  readonly hasUploadedSgf: boolean
  readonly highlightMove: number | null
}

export class TimelineDataSource {
  constructor(private readonly database: Database) {}

  async fetchAll(
    includeDrafts: boolean,
  ): Promise<TimelineEventModel[]> {
    const rows = await this.database
      .select()
      .from(timelineEventsTable)
      .where(isVisible(timelineEventsTable, includeDrafts))
      .orderBy(
        asc(timelineEventsTable.position),
        asc(timelineEventsTable.id),
      )
    return this.withLinks(rows, includeDrafts)
  }

  async fetchById(
    id: number,
    includeDrafts: boolean,
  ): Promise<TimelineEventModel | null> {
    const rows = await this.database
      .select()
      .from(timelineEventsTable)
      .where(
        and(
          eq(timelineEventsTable.id, id),
          isVisible(timelineEventsTable, includeDrafts),
        ),
      )
    const [model] = await this.withLinks(
      rows,
      includeDrafts,
    )
    return model ?? null
  }

  /** The events with their linked games and players (drafts only for those who may see them). */
  private async withLinks(
    events: readonly (typeof timelineEventsTable.$inferSelect)[],
    includeDrafts: boolean,
  ): Promise<TimelineEventModel[]> {
    if (events.length === 0) return []
    const ids = events.map((event) => event.id)
    const [games, players, contributors] =
      await Promise.all([
        this.fetchGameLinks(ids, includeDrafts),
        this.fetchPlayerLinks(ids, includeDrafts),
        this.fetchContributorLinks(ids, includeDrafts),
      ])
    return events.map((event) =>
      TimelineEventModel.fromRawData({
        ...event,
        games: games
          .filter((row) => row.eventId === event.id)
          .map((row) => ({
            slug: row.slug,
            name: row.name,
            // An uploaded record wins over a link, as on the games pages.
            sgf: row.hasUploadedSgf
              ? `/games/${row.slug}/sgf`
              : row.sgfUrl,
            highlightMove: row.highlightMove,
          })),
        players: players
          .filter((row) => row.eventId === event.id)
          .map((row) => ({
            slug: row.slug,
            name: row.name,
            photoUrl: row.photoUrl,
            photoPosition: row.photoPosition,
          })),
        contributors: contributors
          .filter((row) => row.eventId === event.id)
          .map((row) => ({
            slug: row.slug,
            name: row.name,
            kind: row.kind,
            photoUrl: row.photoUrl,
            photoPosition: row.photoPosition,
          })),
      }),
    )
  }

  private fetchGameLinks(
    eventIds: readonly number[],
    includeDrafts: boolean,
  ): Promise<GameLinkRow[]> {
    return this.database
      .select({
        eventId: timelineEventGamesTable.eventId,
        slug: gamesTable.slug,
        name: gamesTable.name,
        sgfUrl: gamesTable.sgfUrl,
        hasUploadedSgf: sql<boolean>`${gamesTable.sgfText} is not null`,
        highlightMove: gamesTable.highlightMove,
      })
      .from(timelineEventGamesTable)
      .innerJoin(
        gamesTable,
        eq(timelineEventGamesTable.gameId, gamesTable.id),
      )
      .where(
        and(
          inArray(timelineEventGamesTable.eventId, [
            ...eventIds,
          ]),
          isVisible(gamesTable, includeDrafts),
        ),
      )
      .orderBy(asc(timelineEventGamesTable.position))
  }

  private fetchPlayerLinks(
    eventIds: readonly number[],
    includeDrafts: boolean,
  ): Promise<PlayerLinkRow[]> {
    return this.database
      .select({
        eventId: timelineEventPlayersTable.eventId,
        slug: playersTable.slug,
        name: playersTable.name,
        photoUrl: playersTable.photoUrl,
        photoPosition: playersTable.photoPosition,
      })
      .from(timelineEventPlayersTable)
      .innerJoin(
        playersTable,
        eq(
          timelineEventPlayersTable.playerId,
          playersTable.id,
        ),
      )
      .where(
        and(
          inArray(timelineEventPlayersTable.eventId, [
            ...eventIds,
          ]),
          isVisible(playersTable, includeDrafts),
        ),
      )
      .orderBy(asc(timelineEventPlayersTable.position))
  }

  private fetchContributorLinks(
    eventIds: readonly number[],
    includeDrafts: boolean,
  ): Promise<ContributorLinkRow[]> {
    return this.database
      .select({
        eventId: timelineEventContributorsTable.eventId,
        slug: contributorsTable.slug,
        name: contributorsTable.name,
        kind: contributorsTable.kind,
        photoUrl: contributorsTable.photoUrl,
        photoPosition: contributorsTable.photoPosition,
      })
      .from(timelineEventContributorsTable)
      .innerJoin(
        contributorsTable,
        eq(
          timelineEventContributorsTable.contributorId,
          contributorsTable.id,
        ),
      )
      .where(
        and(
          inArray(timelineEventContributorsTable.eventId, [
            ...eventIds,
          ]),
          isVisible(contributorsTable, includeDrafts),
        ),
      )
      .orderBy(asc(timelineEventContributorsTable.position))
  }

  async listContributorOptions(includeDrafts: boolean) {
    const rows = await this.database
      .select({
        slug: contributorsTable.slug,
        name: contributorsTable.name,
      })
      .from(contributorsTable)
      .where(isVisible(contributorsTable, includeDrafts))
      .orderBy(asc(sql`lower(${contributorsTable.name})`))
    return rows.map(({ slug, name }) => ({ slug, name }))
  }

  async listGameOptions(includeDrafts: boolean) {
    const rows = await this.database
      .select({
        slug: gamesTable.slug,
        name: gamesTable.name,
      })
      .from(gamesTable)
      .where(isVisible(gamesTable, includeDrafts))
      .orderBy(asc(sql`lower(${gamesTable.name})`))
    return rows.map(({ slug, name }) => ({ slug, name }))
  }

  async listPlayerOptions(includeDrafts: boolean) {
    const rows = await this.database
      .select({
        slug: playersTable.slug,
        name: playersTable.name,
      })
      .from(playersTable)
      .where(isVisible(playersTable, includeDrafts))
      .orderBy(asc(sql`lower(${playersTable.name})`))
    return rows.map(({ slug, name }) => ({ slug, name }))
  }

  async upsert(
    draft: TimelineEventDraft,
    id: number | null,
  ): Promise<void> {
    const {
      gameSlugs,
      playerSlugs,
      contributorSlugs,
      ...fields
    } = draft
    await this.database.transaction(async (tx) => {
      const eventId = await this.writeEvent(tx, fields, id)
      await tx
        .delete(timelineEventGamesTable)
        .where(eq(timelineEventGamesTable.eventId, eventId))
      await tx
        .delete(timelineEventContributorsTable)
        .where(
          eq(
            timelineEventContributorsTable.eventId,
            eventId,
          ),
        )
      await tx
        .delete(timelineEventPlayersTable)
        .where(
          eq(timelineEventPlayersTable.eventId, eventId),
        )
      const games = await this.idsOf(
        tx,
        gamesTable,
        gameSlugs,
      )
      if (games.length > 0) {
        await tx.insert(timelineEventGamesTable).values(
          games.map((gameId, position) => ({
            eventId,
            gameId,
            position,
          })),
        )
      }
      const players = await this.idsOf(
        tx,
        playersTable,
        playerSlugs,
      )
      if (players.length > 0) {
        await tx.insert(timelineEventPlayersTable).values(
          players.map((playerId, position) => ({
            eventId,
            playerId,
            position,
          })),
        )
      }
      const contributors = await this.idsOf(
        tx,
        contributorsTable,
        contributorSlugs,
      )
      if (contributors.length > 0) {
        await tx
          .insert(timelineEventContributorsTable)
          .values(
            contributors.map((contributorId, position) => ({
              eventId,
              contributorId,
              position,
            })),
          )
      }
    })
  }

  private async writeEvent(
    tx: Pick<Database, "select" | "insert" | "update">,
    fields: Omit<
      TimelineEventDraft,
      "gameSlugs" | "playerSlugs" | "contributorSlugs"
    >,
    id: number | null,
  ): Promise<number> {
    if (id !== null) {
      await tx
        .update(timelineEventsTable)
        .set(fields)
        .where(eq(timelineEventsTable.id, id))
      return id
    }
    // A new event goes to the end of the timeline; dragging in the admin moves it.
    const [last] = await tx
      .select({ top: max(timelineEventsTable.position) })
      .from(timelineEventsTable)
    const [row] = await tx
      .insert(timelineEventsTable)
      .values({
        ...fields,
        position: (last?.top ?? -1) + 1,
      })
      .returning({ id: timelineEventsTable.id })
    return row.id
  }

  /** The ids for these slugs, in the order of the slugs. */
  private async idsOf(
    tx: Pick<Database, "select">,
    table:
      | typeof gamesTable
      | typeof playersTable
      | typeof contributorsTable,
    slugs: readonly string[],
  ): Promise<number[]> {
    if (slugs.length === 0) return []
    const rows = await tx
      .select({ id: table.id, slug: table.slug })
      .from(table)
      .where(inArray(table.slug, [...slugs]))
    return slugs.flatMap((slug) => {
      const found = rows.find((row) => row.slug === slug)
      return found === undefined ? [] : [found.id]
    })
  }

  async reorder(ids: readonly number[]): Promise<void> {
    await this.database.transaction(async (tx) => {
      for (const [position, id] of ids.entries()) {
        await tx
          .update(timelineEventsTable)
          .set({ position })
          .where(eq(timelineEventsTable.id, id))
      }
    })
  }

  async delete(id: number): Promise<void> {
    await this.database
      .delete(timelineEventsTable)
      .where(eq(timelineEventsTable.id, id))
  }
}
