import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import { HomeFactsModel } from "./home-facts-model"

const rawGame = {
  slug: "ear-reddening",
  name: "Ear-Reddening",
  year: 1846,
  black: "Shusaku",
  white: "Inseki",
  blackPlayerSlug: "shusaku",
  whitePlayerSlug: null,
  result: "B+2",
  description: "Hook",
  tags: ["ko"],
  sgfUrl: "/sgf/a.sgf",
  hasUploadedSgf: false,
  highlightMove: 127,
}

const spotlightGame = {
  slug: "ear-reddening",
  name: "Ear-Reddening",
  year: 1846,
  black: "Shusaku",
  white: "Inseki",
  blackPlayerSlug: "shusaku",
  whitePlayerSlug: null,
  result: "B+2",
  description: "Hook",
  tags: ["ko"],
  sgf: "/sgf/a.sgf",
  highlightMove: 127,
}

const spotlightPlayer = {
  slug: "shusaku",
  inductionNumber: 1,
  name: "Honinbo Shusaku",
  nativeName: "本因坊秀策",
  country: "Japan",
  distinction: "Invincible",
  photoUrl: "https://example.com/p.jpg",
  photoPosition: "center",
  tags: ["opening"],
}

const validRaw = {
  playerCount: 12,
  gameCount: 8,
  firstYear: 1612,
  lastYear: 2019,
  spotlightGame: rawGame,
  spotlightPlayer,
}

describe("HomeFactsModel", () => {
  it("parses valid raw data", () => {
    const model = HomeFactsModel.fromRawData(validRaw)

    expect(model.playerCount).toBe(12)
    expect(model.gameCount).toBe(8)
    expect(model.firstYear).toBe(1612)
    expect(model.lastYear).toBe(2019)
    expect(model.spotlightGame).toEqual(spotlightGame)
    expect(model.spotlightPlayer).toEqual(spotlightPlayer)
  })

  it("drops extra columns of the spotlight rows", () => {
    const model = HomeFactsModel.fromRawData({
      ...validRaw,
      spotlightGame: { ...rawGame, id: 1 },
      spotlightPlayer: {
        ...spotlightPlayer,
        id: 2,
        bio: "Bio",
      },
    })

    expect(model.spotlightGame).toEqual(spotlightGame)
    expect(model.spotlightPlayer).toEqual(spotlightPlayer)
  })

  it("reads null years and spotlight items as null", () => {
    const model = HomeFactsModel.fromRawData({
      ...validRaw,
      firstYear: null,
      lastYear: null,
      spotlightGame: null,
      spotlightPlayer: null,
    })

    expect(model.firstYear).toBeNull()
    expect(model.lastYear).toBeNull()
    expect(model.spotlightGame).toBeNull()
    expect(model.spotlightPlayer).toBeNull()
  })

  it("reads missing optional fields (undefined) as null", () => {
    const model = HomeFactsModel.fromRawData({
      playerCount: 0,
      gameCount: 0,
    })

    expect(model.firstYear).toBeNull()
    expect(model.lastYear).toBeNull()
    expect(model.spotlightGame).toBeNull()
    expect(model.spotlightPlayer).toBeNull()
  })

  it("reads a null photo URL of the spotlight player as null", () => {
    const model = HomeFactsModel.fromRawData({
      ...validRaw,
      spotlightPlayer: {
        ...spotlightPlayer,
        photoUrl: null,
      },
    })

    expect(model.spotlightPlayer?.photoUrl).toBeNull()
  })

  it.each(["playerCount", "gameCount"])(
    "throws when %s is missing",
    (key) => {
      const raw: Record<string, unknown> = { ...validRaw }
      delete raw[key]

      expect(() => HomeFactsModel.fromRawData(raw)).toThrow(
        InvalidRawDataError,
      )
    },
  )

  it("throws when a count is not an integer", () => {
    expect(() =>
      HomeFactsModel.fromRawData({
        ...validRaw,
        playerCount: "12",
      }),
    ).toThrow('"playerCount" must be an integer')
  })

  it("throws when a year is not an integer", () => {
    expect(() =>
      HomeFactsModel.fromRawData({
        ...validRaw,
        firstYear: "1612",
      }),
    ).toThrow('"firstYear" must be an integer')
  })

  it("uses the uploaded SGF route over the link", () => {
    const model = HomeFactsModel.fromRawData({
      ...validRaw,
      spotlightGame: { ...rawGame, hasUploadedSgf: true },
    })

    expect(model.spotlightGame?.sgf).toBe(
      "/games/ear-reddening/sgf",
    )
  })

  it("reads a null or missing sgfUrl and highlightMove as null", () => {
    const bare: Record<string, unknown> = { ...rawGame }
    delete bare.sgfUrl
    delete bare.highlightMove
    for (const game of [
      { ...rawGame, sgfUrl: null, highlightMove: null },
      bare,
    ]) {
      const model = HomeFactsModel.fromRawData({
        ...validRaw,
        spotlightGame: game,
      })

      expect(model.spotlightGame?.sgf).toBeNull()
      expect(model.spotlightGame?.highlightMove).toBeNull()
    }
  })

  it("reads null player links of the spotlight game as null", () => {
    const model = HomeFactsModel.fromRawData({
      ...validRaw,
      spotlightGame: { ...rawGame, blackPlayerSlug: null },
    })

    expect(model.spotlightGame?.blackPlayerSlug).toBeNull()
  })

  it.each([
    ["a string", "ko"],
    ["a number list", [1]],
    ["missing", undefined],
  ])(
    "throws when the tags of a spotlight are %s",
    (_l, tags) => {
      expect(() =>
        HomeFactsModel.fromRawData({
          ...validRaw,
          spotlightGame: { ...rawGame, tags },
        }),
      ).toThrow(InvalidRawDataError)
      expect(() =>
        HomeFactsModel.fromRawData({
          ...validRaw,
          spotlightPlayer: { ...spotlightPlayer, tags },
        }),
      ).toThrow(InvalidRawDataError)
    },
  )

  it("throws when the spotlight game is not an object", () => {
    expect(() =>
      HomeFactsModel.fromRawData({
        ...validRaw,
        spotlightGame: [],
      }),
    ).toThrow("spotlight game must be an object")
  })

  it.each([
    "slug",
    "name",
    "year",
    "black",
    "white",
    "result",
    "description",
    "hasUploadedSgf",
  ])("throws when the spotlight game lacks %s", (key) => {
    const game: Record<string, unknown> = { ...rawGame }
    delete game[key]

    expect(() =>
      HomeFactsModel.fromRawData({
        ...validRaw,
        spotlightGame: game,
      }),
    ).toThrow(InvalidRawDataError)
  })

  it.each([
    "slug",
    "name",
    "nativeName",
    "inductionNumber",
    "country",
    "distinction",
    "photoPosition",
  ])("throws when the spotlight player lacks %s", (key) => {
    const player: Record<string, unknown> = {
      ...spotlightPlayer,
    }
    delete player[key]

    expect(() =>
      HomeFactsModel.fromRawData({
        ...validRaw,
        spotlightPlayer: player,
      }),
    ).toThrow(InvalidRawDataError)
  })

  it("throws when the spotlight player is a primitive", () => {
    expect(() =>
      HomeFactsModel.fromRawData({
        ...validRaw,
        spotlightPlayer: 3,
      }),
    ).toThrow("spotlight player must be an object")
  })

  it("converts to a plain entity equal to the fields", () => {
    const entity =
      HomeFactsModel.fromRawData(validRaw).toEntity()

    expect(entity).toEqual({
      ...validRaw,
      spotlightGame,
    })
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })
})
