import { asc } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import { timelineEventsTable } from "@/shared/database/data/schema"

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
}
