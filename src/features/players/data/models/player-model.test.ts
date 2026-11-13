import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import {
  PlayerDetailModel,
  PlayerModel,
} from "./player-model"

const validPlayer = {
  slug: "shusaku",
  inductionNumber: 3,
  name: "Honinbo Shusaku",
  nativeName: "本因坊秀策",
  country: "Japan",
  years: "1829-1862",
  distinction: "Invincible",
  bio: "Bio",
  photoUrl: "https://example.com/p.jpg",
  photoPosition: "center top",
  tags: ["opening", "famous"],
  isDraft: false,
}

const validGames = [
  {
    slug: "ear-reddening",
    year: 1846,
    name: "Ear-reddening",
  },
]

function without(
  raw: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const copy = { ...raw }
  delete copy[key]
  return copy
}

describe("PlayerModel", () => {
  it("parses valid raw data", () => {
    const model = PlayerModel.fromRawData(validPlayer)

    expect(model.slug).toBe("shusaku")
    expect(model.country).toBe("Japan")
    expect(model.inductionNumber).toBe(3)
  })

  it.each(
    Object.keys(validPlayer).filter(
      (key) => key !== "photoUrl",
    ),
  )("throws when %s is missing", (key) => {
    expect(() =>
      PlayerModel.fromRawData(without(validPlayer, key)),
    ).toThrow(InvalidRawDataError)
  })

  it("throws on an unknown country", () => {
    expect(() =>
      PlayerModel.fromRawData({
        ...validPlayer,
        country: "France",
      }),
    ).toThrow(
      '"country" must be one of Japan, China, Korea',
    )
  })

  it("throws when the country is not a string", () => {
    expect(() =>
      PlayerModel.fromRawData({
        ...validPlayer,
        country: 1,
      }),
    ).toThrow('"country" must be a string')
  })

  it("throws when the induction number is not an integer", () => {
    expect(() =>
      PlayerModel.fromRawData({
        ...validPlayer,
        inductionNumber: 3.2,
      }),
    ).toThrow('"inductionNumber" must be an integer')
  })

  it("reads a null photo URL as null", () => {
    expect(
      PlayerModel.fromRawData({
        ...validPlayer,
        photoUrl: null,
      }).photoUrl,
    ).toBeNull()
  })

  it("reads a missing photo URL (undefined) as null", () => {
    expect(
      PlayerModel.fromRawData(
        without(validPlayer, "photoUrl"),
      ).photoUrl,
    ).toBeNull()
  })

  it("throws when the photo URL is not a string", () => {
    expect(() =>
      PlayerModel.fromRawData({
        ...validPlayer,
        photoUrl: 5,
      }),
    ).toThrow('"photoUrl" must be a string')
  })

  it("throws when the raw data is not an object", () => {
    expect(() => PlayerModel.fromRawData("x")).toThrow(
      "player must be an object",
    )
  })

  it("parses tags and reads an empty list", () => {
    expect(
      PlayerModel.fromRawData({ ...validPlayer }).tags,
    ).toEqual(["opening", "famous"])
    expect(
      PlayerModel.fromRawData({ ...validPlayer, tags: [] })
        .tags,
    ).toEqual([])
  })

  it.each([
    ["missing", undefined],
    ["a string", "ko"],
    ["an array with a number", ["ko", 3]],
  ])("throws when tags is %s", (_, tags) => {
    expect(() =>
      PlayerModel.fromRawData({ ...validPlayer, tags }),
    ).toThrow(InvalidRawDataError)
  })

  it.each([
    ["missing", undefined],
    ["a string", "true"],
    ["null", null],
  ])("throws when isDraft is %s", (_label, isDraft) => {
    expect(() =>
      PlayerModel.fromRawData({ ...validPlayer, isDraft }),
    ).toThrow('"isDraft" must be a boolean')
  })

  it("keeps isDraft true", () => {
    expect(
      PlayerModel.fromRawData({
        ...validPlayer,
        isDraft: true,
      }).isDraft,
    ).toBe(true)
  })

  it("converts to a plain entity equal to the fields", () => {
    const entity = PlayerModel.fromRawData({
      ...validPlayer,
      id: 7,
    }).toEntity()

    expect(entity).toEqual(validPlayer)
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })
})

describe("PlayerDetailModel", () => {
  const validDetail = {
    ...validPlayer,
    games: validGames,
    resources: [
      {
        title: "T",
        url: "https://example.com",
        description: "Notes",
      },
    ],
  }

  it("parses a player with its game references", () => {
    const model = PlayerDetailModel.fromRawData(validDetail)

    expect(model.slug).toBe("shusaku")
    expect(model.games).toEqual(validGames)
  })

  it("accepts a player without games", () => {
    expect(
      PlayerDetailModel.fromRawData({
        ...validPlayer,
        games: [],
        resources: [],
      }).games,
    ).toEqual([])
  })

  it("throws when games is missing", () => {
    expect(() =>
      PlayerDetailModel.fromRawData(validPlayer),
    ).toThrow('"games" must be an array')
  })

  it("throws when resources is missing", () => {
    expect(() =>
      PlayerDetailModel.fromRawData({
        ...validPlayer,
        games: [],
      }),
    ).toThrow('"resources" must be an array')
  })

  it("throws when a game reference is not an object", () => {
    expect(() =>
      PlayerDetailModel.fromRawData({
        ...validPlayer,
        resources: [],
        games: ["x"],
      }),
    ).toThrow("game reference must be an object")
  })

  it.each(["slug", "year", "name"])(
    "throws when a game reference lacks %s",
    (key) => {
      expect(() =>
        PlayerDetailModel.fromRawData({
          ...validPlayer,
          resources: [],
          games: [without(validGames[0], key)],
        }),
      ).toThrow(InvalidRawDataError)
    },
  )

  it("throws when a base player field is invalid", () => {
    expect(() =>
      PlayerDetailModel.fromRawData({
        ...validDetail,
        country: "France",
      }),
    ).toThrow(InvalidRawDataError)
  })

  it("converts to a plain entity equal to the fields", () => {
    const entity =
      PlayerDetailModel.fromRawData(validDetail).toEntity()

    expect(entity).toEqual(validDetail)
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })
})
