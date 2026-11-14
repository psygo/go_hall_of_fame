import {
  asRecord,
  readArray,
  readInteger,
  readBoolean,
  readNullableInteger,
  readNullableString,
  readStringArray,
  readString,
  type RawRecord,
} from "@/core/raw-data"

import {
  spotlightSgfSource,
  type HomeFacts,
  type SpotlightGame,
  type SpotlightPlayer,
} from "../../domain/entities/home-summary"

export class HomeFactsModel implements HomeFacts {
  declare readonly playerCount: number
  declare readonly gameCount: number
  declare readonly firstYear: number | null
  declare readonly lastYear: number | null
  declare readonly spotlightGame: SpotlightGame | null
  declare readonly spotlightPlayers: readonly SpotlightPlayer[]

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
      spotlightGame: parseOptional(
        record,
        "spotlightGame",
        parseGame,
      ),
      spotlightPlayers: readArray(
        record,
        "spotlightPlayers",
      ).map(parsePlayer),
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

function parseGame(raw: unknown): SpotlightGame {
  const record = asRecord(raw, "spotlight game")
  const slug = readString(record, "slug")
  return {
    slug,
    name: readString(record, "name"),
    year: readInteger(record, "year"),
    black: readString(record, "black"),
    white: readString(record, "white"),
    blackPlayerSlug: readNullableString(
      record,
      "blackPlayerSlug",
    ),
    whitePlayerSlug: readNullableString(
      record,
      "whitePlayerSlug",
    ),
    result: readString(record, "result"),
    description: readString(record, "description"),
    tags: readStringArray(record, "tags"),
    sgf: spotlightSgfSource({
      slug,
      sgfUrl: readNullableString(record, "sgfUrl"),
      hasUploadedSgf: readBoolean(record, "hasUploadedSgf"),
    }),
    highlightMove: readNullableInteger(
      record,
      "highlightMove",
    ),
  }
}

function parsePlayer(raw: unknown): SpotlightPlayer {
  const record = asRecord(raw, "spotlight player")
  return {
    slug: readString(record, "slug"),
    inductionNumber: readInteger(record, "inductionNumber"),
    name: readString(record, "name"),
    nativeName: readString(record, "nativeName"),
    country: readString(record, "country"),
    distinction: readString(record, "distinction"),
    photoUrl: readNullableString(record, "photoUrl"),
    photoPosition: readString(record, "photoPosition"),
    tags: readStringArray(record, "tags"),
  }
}
