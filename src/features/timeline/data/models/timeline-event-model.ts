import {
  asRecord,
  readNullableInteger,
  readNullableString,
  readArray,
  readInteger,
  readBoolean,
  readString,
} from "@/core/raw-data"

import type {
  TimelineEvent,
  TimelineLinkedContributor,
  TimelineLinkedGame,
  TimelineLinkedPlayer,
} from "../../domain/entities/timeline-event"

export class TimelineEventModel implements TimelineEvent {
  declare readonly id: number
  declare readonly year: string
  declare readonly title: string
  declare readonly text: string
  declare readonly games: readonly TimelineLinkedGame[]
  declare readonly players: readonly TimelineLinkedPlayer[]
  declare readonly contributors: readonly TimelineLinkedContributor[]
  declare readonly showGameTitles: boolean
  declare readonly isDraft: boolean

  private constructor(fields: TimelineEvent) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): TimelineEventModel {
    const record = asRecord(raw, "timeline event")
    return new TimelineEventModel({
      id: readInteger(record, "id"),
      year: readString(record, "year"),
      title: readString(record, "title"),
      text: readString(record, "text"),
      games: readArray(record, "games").map(
        parseLinkedGame,
      ),
      players: readArray(record, "players").map(
        parseLinkedPlayer,
      ),
      contributors: readArray(record, "contributors").map(
        parseLinkedContributor,
      ),
      showGameTitles: readBoolean(record, "showGameTitles"),
      isDraft: readBoolean(record, "isDraft"),
    })
  }

  toEntity(): TimelineEvent {
    return { ...this }
  }
}

function parseLinkedGame(raw: unknown): TimelineLinkedGame {
  const record = asRecord(raw, "linked game")
  return {
    slug: readString(record, "slug"),
    name: readString(record, "name"),
    sgf: readNullableString(record, "sgf"),
    highlightMove: readNullableInteger(
      record,
      "highlightMove",
    ),
  }
}

function parseLinkedContributor(
  raw: unknown,
): TimelineLinkedContributor {
  const record = asRecord(raw, "linked contributor")
  return {
    slug: readString(record, "slug"),
    name: readString(record, "name"),
    kind: readString(record, "kind"),
    photoUrl: readNullableString(record, "photoUrl"),
    photoPosition: readString(record, "photoPosition"),
  }
}

function parseLinkedPlayer(
  raw: unknown,
): TimelineLinkedPlayer {
  const record = asRecord(raw, "linked player")
  return {
    slug: readString(record, "slug"),
    name: readString(record, "name"),
    photoUrl: readNullableString(record, "photoUrl"),
    photoPosition: readString(record, "photoPosition"),
  }
}
