import {
  asRecord,
  readInteger,
  readNullableString,
  readString,
  type RawRecord,
} from "@/core/raw-data"

import type {
  FeaturedGame,
  FeaturedPlayer,
  HomeFacts,
} from "../../domain/entities/home-summary"

export class HomeFactsModel implements HomeFacts {
  declare readonly playerCount: number
  declare readonly gameCount: number
  declare readonly firstYear: number | null
  declare readonly lastYear: number | null
  declare readonly featuredGame: FeaturedGame | null
  declare readonly featuredPlayer: FeaturedPlayer | null

  private constructor(fields: HomeFacts) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): HomeFactsModel {
    const record = asRecord(raw, "home facts")
    return new HomeFactsModel({
      playerCount: readInteger(record, "playerCount"),
      gameCount: readInteger(record, "gameCount"),
      firstYear: readOptionalInteger(record, "firstYear"),
      lastYear: readOptionalInteger(record, "lastYear"),
      featuredGame: parseOptional(
        record,
        "featuredGame",
        parseGame,
      ),
      featuredPlayer: parseOptional(
        record,
        "featuredPlayer",
        parsePlayer,
      ),
    })
  }

  toEntity(): HomeFacts {
    return { ...this }
  }
}

function parseOptional<T>(
  record: RawRecord,
  key: string,
  parse: (raw: unknown) => T,
): T | null {
  const value = record[key]
  return value === null || value === undefined
    ? null
    : parse(value)
}

function readOptionalInteger(
  record: RawRecord,
  key: string,
): number | null {
  return record[key] === null || record[key] === undefined
    ? null
    : readInteger(record, key)
}

function parseGame(raw: unknown): FeaturedGame {
  const record = asRecord(raw, "featured game")
  return {
    slug: readString(record, "slug"),
    name: readString(record, "name"),
    year: readInteger(record, "year"),
    black: readString(record, "black"),
    white: readString(record, "white"),
    description: readString(record, "description"),
  }
}

function parsePlayer(raw: unknown): FeaturedPlayer {
  const record = asRecord(raw, "featured player")
  return {
    slug: readString(record, "slug"),
    name: readString(record, "name"),
    nativeName: readString(record, "nativeName"),
    years: readString(record, "years"),
    photoUrl: readNullableString(record, "photoUrl"),
    photoPosition: readString(record, "photoPosition"),
  }
}
