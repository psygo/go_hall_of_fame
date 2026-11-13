import {
  asRecord,
  readArray,
  readBoolean,
  readInteger,
  readNullableString,
  readString,
} from "@/core/raw-data"

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
  declare readonly result: string
  declare readonly setting: string
  declare readonly hook: string
  declare readonly moment: string
  declare readonly legacy: string
  declare readonly sgfUrl: string | null
  declare readonly featured: boolean
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
    return new GameDetailModel({
      ...parseGameFields(record),
      players,
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
    result: readString(record, "result"),
    setting: readString(record, "setting"),
    hook: readString(record, "hook"),
    moment: readString(record, "moment"),
    legacy: readString(record, "legacy"),
    sgfUrl: readNullableString(record, "sgfUrl"),
    featured: readBoolean(record, "featured"),
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
