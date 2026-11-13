import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import { TimelineEventModel } from "./timeline-event-model"

const validRaw = {
  id: 4,
  year: "c. 1612",
  title: "Founded",
  text: "Text",
  games: [],
  players: [],
  contributors: [],
  isDraft: false,
}

describe("TimelineEventModel", () => {
  it("parses valid raw data", () => {
    const model = TimelineEventModel.fromRawData(validRaw)

    expect(model.id).toBe(4)
    expect(model.year).toBe("c. 1612")
    expect(model.title).toBe("Founded")
    expect(model.text).toBe("Text")
  })

  it("ignores extra columns", () => {
    const entity = TimelineEventModel.fromRawData({
      ...validRaw,
      extra: "x",
    }).toEntity()

    expect(entity).toEqual(validRaw)
  })

  it("throws when the id is not an integer", () => {
    expect(() =>
      TimelineEventModel.fromRawData({
        ...validRaw,
        id: "4",
      }),
    ).toThrow('"id" must be an integer')
  })

  it.each(["id", "year", "title", "text"])(
    "throws when %s is missing",
    (key) => {
      const raw: Record<string, unknown> = { ...validRaw }
      delete raw[key]

      expect(() =>
        TimelineEventModel.fromRawData(raw),
      ).toThrow(InvalidRawDataError)
    },
  )

  it("throws when the year is not a string", () => {
    expect(() =>
      TimelineEventModel.fromRawData({
        ...validRaw,
        year: 1612,
      }),
    ).toThrow('"year" must be a string')
  })

  it.each([
    ["missing", undefined],
    ["a string", "true"],
  ])("throws when isDraft is %s", (_label, isDraft) => {
    expect(() =>
      TimelineEventModel.fromRawData({
        ...validRaw,
        isDraft,
      }),
    ).toThrow('"isDraft" must be a boolean')
  })

  it("keeps isDraft true", () => {
    expect(
      TimelineEventModel.fromRawData({
        ...validRaw,
        isDraft: true,
      }).isDraft,
    ).toBe(true)
  })

  it("throws when the raw data is not an object", () => {
    expect(() =>
      TimelineEventModel.fromRawData(null),
    ).toThrow("timeline event must be an object")
  })

  it("converts to a plain entity equal to the fields", () => {
    const entity =
      TimelineEventModel.fromRawData(validRaw).toEntity()

    expect(entity).toEqual(validRaw)
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })
  it("reads the linked games and players in order", () => {
    const games = [
      {
        slug: "ear-reddening",
        name: "Ear-Reddening",
        sgf: "/sgf/a.sgf",
        highlightMove: 127,
      },
      {
        slug: "move-78",
        name: "Move 78",
        sgf: null,
        highlightMove: null,
      },
    ]
    const players = [{ slug: "shusaku", name: "Shusaku" }]

    const entity = TimelineEventModel.fromRawData({
      ...validRaw,
      games: [{ ...games[0], extra: 1 }, games[1]],
      players,
    }).toEntity()

    expect(entity.games).toEqual(games)
    expect(entity.players).toEqual(players)
  })

  describe("linked game sgf and highlight move", () => {
    const base = { slug: "g", name: "G" }
    const parse = (game: Record<string, unknown>) =>
      TimelineEventModel.fromRawData({
        ...validRaw,
        games: [game],
      }).toEntity().games[0]

    it("reads a string sgf and an integer highlight move", () => {
      expect(
        parse({
          ...base,
          sgf: "/sgf/g.sgf",
          highlightMove: 50,
        }),
      ).toEqual({
        ...base,
        sgf: "/sgf/g.sgf",
        highlightMove: 50,
      })
    })

    it("reads null values as null", () => {
      expect(
        parse({ ...base, sgf: null, highlightMove: null }),
      ).toEqual({ ...base, sgf: null, highlightMove: null })
    })

    it("reads missing keys as null", () => {
      expect(parse(base)).toEqual({
        ...base,
        sgf: null,
        highlightMove: null,
      })
    })

    it("throws when the sgf is not a string", () => {
      expect(() => parse({ ...base, sgf: 5 })).toThrow(
        InvalidRawDataError,
      )
    })

    it.each(["50", 1.5, true])(
      "throws when the highlight move is %j",
      (highlightMove) => {
        expect(() =>
          parse({ ...base, highlightMove }),
        ).toThrow(InvalidRawDataError)
      },
    )

    it("keeps players and contributors as slug and name only", () => {
      const entity = TimelineEventModel.fromRawData({
        ...validRaw,
        players: [{ ...base, sgf: "x", highlightMove: 1 }],
        contributors: [{ ...base, sgf: "x" }],
      }).toEntity()

      expect(entity.players).toEqual([base])
      expect(entity.contributors).toEqual([base])
    })
  })

  it.each(["games", "players", "contributors"])(
    "throws when %s is missing or not an array",
    (key) => {
      const missing: Record<string, unknown> = {
        ...validRaw,
      }
      delete missing[key]

      expect(() =>
        TimelineEventModel.fromRawData(missing),
      ).toThrow(InvalidRawDataError)
      expect(() =>
        TimelineEventModel.fromRawData({
          ...validRaw,
          [key]: "x",
        }),
      ).toThrow(InvalidRawDataError)
    },
  )

  it("reads the linked contributors in order", () => {
    const contributors = [
      { slug: "kgs", name: "KGS" },
      { slug: "demis-hassabis", name: "Demis Hassabis" },
    ]

    expect(
      TimelineEventModel.fromRawData({
        ...validRaw,
        contributors,
      }).toEntity().contributors,
    ).toEqual(contributors)
  })

  it.each([
    ["not an object", "x"],
    ["without a name", { slug: "a" }],
    ["without a slug", { name: "A" }],
    ["with a numeric slug", { slug: 1, name: "A" }],
  ])("throws when a linked item is %s", (_label, item) => {
    expect(() =>
      TimelineEventModel.fromRawData({
        ...validRaw,
        games: [item],
      }),
    ).toThrow(InvalidRawDataError)
    expect(() =>
      TimelineEventModel.fromRawData({
        ...validRaw,
        players: [item],
      }),
    ).toThrow(InvalidRawDataError)
    expect(() =>
      TimelineEventModel.fromRawData({
        ...validRaw,
        contributors: [item],
      }),
    ).toThrow(InvalidRawDataError)
  })
})
