import { asc, eq } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import { timelineEventsTable } from "@/shared/database/data/schema"

import type { TimelineEventDraft } from "../../domain/entities/timeline-event-draft"
import { TimelineEventModel } from "../models/timeline-event-model"

export class TimelineDataSource {
  constructor(private readonly database: Database) {}

  async fetchAll(): Promise<TimelineEventModel[]> {
    const rows = await this.database
      .select()
      .from(timelineEventsTable)
      .orderBy(
        asc(timelineEventsTable.year),
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
      .select()
      .from(timelineEventsTable)
      .where(eq(timelineEventsTable.id, id))
    return row === undefined
      ? null
      : TimelineEventModel.fromRawData(row)
  }

  async upsert(
    draft: TimelineEventDraft,
    id: number | null,
  ): Promise<void> {
    if (id === null) {
      await this.database
        .insert(timelineEventsTable)
        .values(draft)
      return
    }
    await this.database
      .update(timelineEventsTable)
      .set(draft)
      .where(eq(timelineEventsTable.id, id))
  }

  async delete(id: number): Promise<void> {
    await this.database
      .delete(timelineEventsTable)
      .where(eq(timelineEventsTable.id, id))
  }
}
