import {
  asRecord,
  readArray,
  readBoolean,
  readInteger,
  readNullableInteger,
  readNullableString,
  readString,
  readStringArray,
} from "@/core/raw-data"

import type { ResourceLink } from "@/core/resources"

import type {
  Game,
  GameDetail,
  GamePlayerReference,
} from "../../domain/entities/game"

export class GameModel implements Game {
  declare readonly slug: string
  declare readonly year: number
  declare readonly name: string
  declare readonly black: string
  declare readonly white: string
  declare readonly blackPlayerSlug: string | null
  declare readonly whitePlayerSlug: string | null
  declare readonly result: string
  declare readonly setting: string
  declare readonly description: string
  declare readonly sgfUrl: string | null
  declare readonly hasUploadedSgf: boolean
  declare readonly highlightMove: number | null
  declare readonly featured: boolean
  declare readonly tags: readonly string[]
  declare readonly sequence: number

  protected constructor(fields: Game) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): GameModel {
    return new GameModel(parseGameFields(raw))
  }

  toEntity(): Game {
    return { ...this }
  }
}

export class GameDetailModel
  extends GameModel
  implements GameDetail
{
  declare readonly players: readonly GamePlayerReference[]
  declare readonly resources: readonly ResourceLink[]

  private constructor(fields: GameDetail) {
    super(fields)
  }

  static override fromRawData(
    raw: unknown,
  ): GameDetailModel {
    const record = asRecord(raw, "game")
    const players = readArray(record, "players").map(
      parsePlayerReference,
    )
    const resources = readArray(record, "resources").map(
      parseResourceLink,
    )
    return new GameDetailModel({
      ...parseGameFields(record),
      players,
      resources,
    })
  }

  override toEntity(): GameDetail {
    return { ...this }
  }
}

function parseGameFields(raw: unknown): Game {
  const record = asRecord(raw, "game")
  return {
    slug: readString(record, "slug"),
    year: readInteger(record, "year"),
    name: readString(record, "name"),
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
    setting: readString(record, "setting"),
    description: readString(record, "description"),
    sgfUrl: readNullableString(record, "sgfUrl"),
    hasUploadedSgf: readBoolean(record, "hasUploadedSgf"),
    highlightMove: readNullableInteger(
      record,
      "highlightMove",
    ),
    featured: readBoolean(record, "featured"),
    tags: readStringArray(record, "tags"),
    sequence: readInteger(record, "sequence"),
  }
}

function parsePlayerReference(
  raw: unknown,
): GamePlayerReference {
  const record = asRecord(raw, "player reference")
  return {
    slug: readString(record, "slug"),
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
