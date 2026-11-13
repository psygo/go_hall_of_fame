import {
  asRecord,
  readInteger,
  readNullableString,
  readString,
} from "@/core/raw-data"

import type {
  TimelineEvent,
  TimelineGameReference,
} from "../../domain/entities/timeline-event"

export class TimelineEventModel implements TimelineEvent {
  declare readonly id: number
  declare readonly year: number
  declare readonly title: string
  declare readonly text: string
  declare readonly game: TimelineGameReference | null

  private constructor(fields: TimelineEvent) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): TimelineEventModel {
    const record = asRecord(raw, "timeline event")
    return new TimelineEventModel({
      id: readInteger(record, "id"),
      year: readInteger(record, "year"),
      title: readString(record, "title"),
      text: readString(record, "text"),
      game: parseGame(record),
    })
  }

  toEntity(): TimelineEvent {
    return { ...this }
  }
}

function parseGame(
  record: Record<string, unknown>,
): TimelineGameReference | null {
  const slug = readNullableString(record, "gameSlug")
  if (slug === null) return null
  return { slug, name: readString(record, "gameName") }
}
