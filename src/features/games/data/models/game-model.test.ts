import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import { GameDetailModel, GameModel } from "./game-model"

const validGame = {
  slug: "ear-reddening",
  year: 1846,
  name: "The Ear-Reddening Game",
  black: "Honinbo Shusaku",
  white: "Gennan Inseki",
  result: "B+2",
  setting: "Setting",
  hook: "Hook",
  moment: "Moment",
  legacy: "Legacy",
  sgfUrl: "https://example.com/g.sgf",
}

const validPlayers = [
  { slug: "shusaku", name: "Honinbo Shusaku" },
]

function without(
  raw: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const copy = { ...raw }
  delete copy[key]
  return copy
}

describe("GameModel", () => {
  it("parses valid raw data", () => {
    const model = GameModel.fromRawData(validGame)

    expect(model.slug).toBe("ear-reddening")
    expect(model.year).toBe(1846)
    expect(model.sgfUrl).toBe("https://example.com/g.sgf")
  })

  it.each(
    Object.keys(validGame).filter(
      (key) => key !== "sgfUrl",
    ),
  )("throws when %s is missing", (key) => {
    expect(() =>
      GameModel.fromRawData(without(validGame, key)),
    ).toThrow(InvalidRawDataError)
  })

  it("throws when the year is not an integer", () => {
    expect(() =>
      GameModel.fromRawData({ ...validGame, year: "1846" }),
    ).toThrow('"year" must be an integer')
  })

  it("reads a null SGF URL as null", () => {
    expect(
      GameModel.fromRawData({ ...validGame, sgfUrl: null })
        .sgfUrl,
    ).toBeNull()
  })

  it("reads a missing SGF URL (undefined) as null", () => {
    expect(
      GameModel.fromRawData(without(validGame, "sgfUrl"))
        .sgfUrl,
    ).toBeNull()
  })

  it("throws when the SGF URL is not a string", () => {
    expect(() =>
      GameModel.fromRawData({ ...validGame, sgfUrl: 1 }),
    ).toThrow('"sgfUrl" must be a string')
  })

  it("throws when the raw data is null", () => {
    expect(() => GameModel.fromRawData(null)).toThrow(
      "game must be an object",
    )
  })

  it("converts to a plain entity equal to the fields", () => {
    const entity = GameModel.fromRawData({
      ...validGame,
      id: 1,
      sequence: 2,
      featured: false,
    }).toEntity()

    expect(entity).toEqual(validGame)
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })
})

describe("GameDetailModel", () => {
  const validDetail = {
    ...validGame,
    players: validPlayers,
  }

  it("parses a game with its player references", () => {
    const model = GameDetailModel.fromRawData(validDetail)

    expect(model.slug).toBe("ear-reddening")
    expect(model.players).toEqual(validPlayers)
  })

  it("accepts a game without players", () => {
    expect(
      GameDetailModel.fromRawData({
        ...validGame,
        players: [],
      }).players,
    ).toEqual([])
  })

  it("throws when players is missing", () => {
    expect(() =>
      GameDetailModel.fromRawData(validGame),
    ).toThrow('"players" must be an array')
  })

  it("throws when a player reference is not an object", () => {
    expect(() =>
      GameDetailModel.fromRawData({
        ...validGame,
        players: [null],
      }),
    ).toThrow("player reference must be an object")
  })

  it.each(["slug", "name"])(
    "throws when a player reference lacks %s",
    (key) => {
      expect(() =>
        GameDetailModel.fromRawData({
          ...validGame,
          players: [without(validPlayers[0], key)],
        }),
      ).toThrow(InvalidRawDataError)
    },
  )

  it("throws when a base game field is invalid", () => {
    expect(() =>
      GameDetailModel.fromRawData({
        ...validDetail,
        year: null,
      }),
    ).toThrow(InvalidRawDataError)
  })

  it("converts to a plain entity equal to the fields", () => {
    const entity =
      GameDetailModel.fromRawData(validDetail).toEntity()

    expect(entity).toEqual(validDetail)
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })
})
