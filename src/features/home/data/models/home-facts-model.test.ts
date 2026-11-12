import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import { HomeFactsModel } from "./home-facts-model"

const featuredGame = {
  slug: "ear-reddening",
  name: "Ear-Reddening",
  year: 1846,
  black: "Shusaku",
  white: "Inseki",
  hook: "Hook",
}

const featuredPlayer = {
  slug: "shusaku",
  name: "Honinbo Shusaku",
  nativeName: "本因坊秀策",
  years: "1829-1862",
  photoUrl: "https://example.com/p.jpg",
  photoPosition: "center",
}

const validRaw = {
  playerCount: 12,
  gameCount: 8,
  firstYear: 1612,
  lastYear: 2019,
  featuredGame,
  featuredPlayer,
}

describe("HomeFactsModel", () => {
  it("parses valid raw data", () => {
    const model = HomeFactsModel.fromRawData(validRaw)

    expect(model.playerCount).toBe(12)
    expect(model.gameCount).toBe(8)
    expect(model.firstYear).toBe(1612)
    expect(model.lastYear).toBe(2019)
    expect(model.featuredGame).toEqual(featuredGame)
    expect(model.featuredPlayer).toEqual(featuredPlayer)
  })

  it("drops extra columns of the featured rows", () => {
    const model = HomeFactsModel.fromRawData({
      ...validRaw,
      featuredGame: {
        ...featuredGame,
        id: 1,
        featured: true,
      },
      featuredPlayer: {
        ...featuredPlayer,
        id: 2,
        bio: "Bio",
      },
    })

    expect(model.featuredGame).toEqual(featuredGame)
    expect(model.featuredPlayer).toEqual(featuredPlayer)
  })

  it("reads null years and featured items as null", () => {
    const model = HomeFactsModel.fromRawData({
      ...validRaw,
      firstYear: null,
      lastYear: null,
      featuredGame: null,
      featuredPlayer: null,
    })

    expect(model.firstYear).toBeNull()
    expect(model.lastYear).toBeNull()
    expect(model.featuredGame).toBeNull()
    expect(model.featuredPlayer).toBeNull()
  })

  it("reads missing optional fields (undefined) as null", () => {
    const model = HomeFactsModel.fromRawData({
      playerCount: 0,
      gameCount: 0,
    })

    expect(model.firstYear).toBeNull()
    expect(model.lastYear).toBeNull()
    expect(model.featuredGame).toBeNull()
    expect(model.featuredPlayer).toBeNull()
  })

  it("reads a null photo URL of the featured player as null", () => {
    const model = HomeFactsModel.fromRawData({
      ...validRaw,
      featuredPlayer: { ...featuredPlayer, photoUrl: null },
    })

    expect(model.featuredPlayer?.photoUrl).toBeNull()
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

  it("throws when the featured game is not an object", () => {
    expect(() =>
      HomeFactsModel.fromRawData({
        ...validRaw,
        featuredGame: [],
      }),
    ).toThrow("featured game must be an object")
  })

  it.each([
    "slug",
    "name",
    "year",
    "black",
    "white",
    "hook",
  ])("throws when the featured game lacks %s", (key) => {
    const game: Record<string, unknown> = {
      ...featuredGame,
    }
    delete game[key]

    expect(() =>
      HomeFactsModel.fromRawData({
        ...validRaw,
        featuredGame: game,
      }),
    ).toThrow(InvalidRawDataError)
  })

  it.each([
    "slug",
    "name",
    "nativeName",
    "years",
    "photoPosition",
  ])("throws when the featured player lacks %s", (key) => {
    const player: Record<string, unknown> = {
      ...featuredPlayer,
    }
    delete player[key]

    expect(() =>
      HomeFactsModel.fromRawData({
        ...validRaw,
        featuredPlayer: player,
      }),
    ).toThrow(InvalidRawDataError)
  })

  it("throws when the featured player is a primitive", () => {
    expect(() =>
      HomeFactsModel.fromRawData({
        ...validRaw,
        featuredPlayer: 3,
      }),
    ).toThrow("featured player must be an object")
  })

  it("converts to a plain entity equal to the fields", () => {
    const entity =
      HomeFactsModel.fromRawData(validRaw).toEntity()

    expect(entity).toEqual(validRaw)
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })
})
