import {
  asRecord,
  readArray,
  readBoolean,
  readInteger,
  readOneOf,
  readNullableString,
  readString,
} from "@/core/raw-data"

import {
  COUNTRIES,
  type Player,
  type PlayerDetail,
  type PlayerGameReference,
} from "../../domain/entities/player"

export class PlayerModel implements Player {
  declare readonly slug: string
  declare readonly inductionNumber: number
  declare readonly name: string
  declare readonly nativeName: string
  declare readonly country: Player["country"]
  declare readonly years: string
  declare readonly distinction: string
  declare readonly bio: string
  declare readonly photoUrl: string | null
  declare readonly photoPosition: string
  declare readonly featured: boolean

  protected constructor(fields: Player) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): PlayerModel {
    return new PlayerModel(parsePlayerFields(raw))
  }

  toEntity(): Player {
    return { ...this }
  }
}

export class PlayerDetailModel
  extends PlayerModel
  implements PlayerDetail
{
  declare readonly games: readonly PlayerGameReference[]

  private constructor(fields: PlayerDetail) {
    super(fields)
  }

  static override fromRawData(
    raw: unknown,
  ): PlayerDetailModel {
    const record = asRecord(raw, "player")
    const games = readArray(record, "games").map(
      parseGameReference,
    )
    return new PlayerDetailModel({
      ...parsePlayerFields(record),
      games,
    })
  }

  override toEntity(): PlayerDetail {
    return { ...this }
  }
}

function parsePlayerFields(raw: unknown): Player {
  const record = asRecord(raw, "player")
  return {
    slug: readString(record, "slug"),
    inductionNumber: readInteger(record, "inductionNumber"),
    name: readString(record, "name"),
    nativeName: readString(record, "nativeName"),
    country: readOneOf(record, "country", COUNTRIES),
    years: readString(record, "years"),
    distinction: readString(record, "distinction"),
    bio: readString(record, "bio"),
    photoUrl: readNullableString(record, "photoUrl"),
    photoPosition: readString(record, "photoPosition"),
    featured: readBoolean(record, "featured"),
  }
}

function parseGameReference(
  raw: unknown,
): PlayerGameReference {
  const record = asRecord(raw, "game reference")
  return {
    slug: readString(record, "slug"),
    year: readInteger(record, "year"),
    name: readString(record, "name"),
  }
}
