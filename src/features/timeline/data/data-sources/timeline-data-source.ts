import { asc, eq, max } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import {
  gamesTable,
  timelineEventsTable,
} from "@/shared/database/data/schema"

import type { TimelineEventDraft } from "../../domain/entities/timeline-event-draft"
import { TimelineEventModel } from "../models/timeline-event-model"

const eventSelection = {
  id: timelineEventsTable.id,
  year: timelineEventsTable.year,
  title: timelineEventsTable.title,
  text: timelineEventsTable.text,
  gameSlug: gamesTable.slug,
  gameName: gamesTable.name,
}

export class TimelineDataSource {
  constructor(private readonly database: Database) {}

  async fetchAll(): Promise<TimelineEventModel[]> {
    const rows = await this.database
      .select(eventSelection)
      .from(timelineEventsTable)
      .leftJoin(
        gamesTable,
        eq(timelineEventsTable.gameId, gamesTable.id),
      )
      .orderBy(
        asc(timelineEventsTable.position),
        asc(timelineEventsTable.id),
      )
    return rows.map((row) =>
      TimelineEventModel.fromRawData(row),
    )
  }

  async fetchById(
    id: number,
  ): Promise<TimelineEventModel | null> {
    const [row] = await this.database
      .select(eventSelection)
      .from(timelineEventsTable)
      .leftJoin(
        gamesTable,
        eq(timelineEventsTable.gameId, gamesTable.id),
      )
      .where(eq(timelineEventsTable.id, id))
    return row === undefined
      ? null
      : TimelineEventModel.fromRawData(row)
  }

  async listGameOptions() {
    const rows = await this.database
      .select({
        slug: gamesTable.slug,
        name: gamesTable.name,
      })
      .from(gamesTable)
      .orderBy(
        asc(gamesTable.year),
        asc(gamesTable.sequence),
        asc(gamesTable.id),
      )
    return rows.map(({ slug, name }) => ({ slug, name }))
  }

  async upsert(
    draft: TimelineEventDraft,
    id: number | null,
  ): Promise<void> {
    const { gameSlug, ...fields } = draft
    const gameId = await this.findGameId(gameSlug)
    const values = { ...fields, gameId }
    if (id === null) {
      // A new event goes to the end of the timeline; dragging in the admin moves it.
      const [last] = await this.database
        .select({ top: max(timelineEventsTable.position) })
        .from(timelineEventsTable)
      await this.database
        .insert(timelineEventsTable)
        .values({
          ...values,
          position: (last?.top ?? -1) + 1,
        })
      return
    }
    await this.database
      .update(timelineEventsTable)
      .set(values)
      .where(eq(timelineEventsTable.id, id))
  }

  private async findGameId(
    slug: string | null,
  ): Promise<number | null> {
    if (slug === null) return null
    const [row] = await this.database
      .select({ id: gamesTable.id })
      .from(gamesTable)
      .where(eq(gamesTable.slug, slug))
    return row?.id ?? null
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
