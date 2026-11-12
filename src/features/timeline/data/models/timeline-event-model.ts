import {
  asRecord,
  readInteger,
  readString,
} from "@/core/raw-data"

import type { TimelineEvent } from "../../domain/entities/timeline-event"

export class TimelineEventModel implements TimelineEvent {
  declare readonly year: number
  declare readonly title: string
  declare readonly text: string

  private constructor(fields: TimelineEvent) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): TimelineEventModel {
    const record = asRecord(raw, "timeline event")
    return new TimelineEventModel({
      year: readInteger(record, "year"),
      title: readString(record, "title"),
      text: readString(record, "text"),
    })
  }

  toEntity(): TimelineEvent {
    return { ...this }
  }
}
