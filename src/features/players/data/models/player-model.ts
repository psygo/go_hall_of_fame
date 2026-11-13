import {
  asRecord,
  readArray,
  readInteger,
  readOneOf,
  readNullableString,
  readString,
  readBoolean,
  readStringArray,
} from "@/core/raw-data"

import type { ResourceLink } from "@/core/resources"

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
  declare readonly birthYear: number
  declare readonly distinction: string
  declare readonly bio: string
  declare readonly photoUrl: string | null
  declare readonly photoPosition: string
  declare readonly tags: readonly string[]
  declare readonly isDraft: boolean

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
  declare readonly resources: readonly ResourceLink[]

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
    const resources = readArray(record, "resources").map(
      parseResourceLink,
    )
    return new PlayerDetailModel({
      ...parsePlayerFields(record),
      games,
      resources,
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
    birthYear: readInteger(record, "birthYear"),
    distinction: readString(record, "distinction"),
    bio: readString(record, "bio"),
    photoUrl: readNullableString(record, "photoUrl"),
    photoPosition: readString(record, "photoPosition"),
    tags: readStringArray(record, "tags"),
    isDraft: readBoolean(record, "isDraft"),
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

function parseResourceLink(raw: unknown): ResourceLink {
  const record = asRecord(raw, "resource")
  return {
    title: readString(record, "title"),
    url: readString(record, "url"),
    description: readNullableString(record, "description"),
  }
}
