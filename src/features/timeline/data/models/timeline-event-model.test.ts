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
  showGameTitles: false,
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

  it.each([
    ["missing", undefined],
    ["a string", "true"],
    ["null", null],
  ])(
    "throws when showGameTitles is %s",
    (_label, showGameTitles) => {
      expect(() =>
        TimelineEventModel.fromRawData({
          ...validRaw,
          showGameTitles,
        }),
      ).toThrow('"showGameTitles" must be a boolean')
    },
  )

  it("keeps showGameTitles true", () => {
    expect(
      TimelineEventModel.fromRawData({
        ...validRaw,
        showGameTitles: true,
      }).showGameTitles,
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
    const players = [
      {
        slug: "shusaku",
        name: "Shusaku",
        photoUrl: "/portraits/shusaku.webp",
        photoPosition: "40% 20%",
      },
      {
        slug: "lee-sedol",
        name: "Lee Sedol",
        photoUrl: null,
        photoPosition: "50% 50%",
      },
    ]

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
  })

  describe("linked player photo", () => {
    const base = {
      slug: "p",
      name: "P",
      photoPosition: "50% 50%",
    }
    const parse = (player: Record<string, unknown>) =>
      TimelineEventModel.fromRawData({
        ...validRaw,
        players: [player],
      }).toEntity().players[0]

    it("reads a string photo URL", () => {
      expect(
        parse({ ...base, photoUrl: "/p.webp" }),
      ).toEqual({
        ...base,
        photoUrl: "/p.webp",
      })
    })

    it.each([null, undefined])(
      "reads a %s photo URL as null",
      (photoUrl) => {
        expect(
          parse({ ...base, photoUrl }).photoUrl,
        ).toBeNull()
      },
    )

    it("throws when the photo URL is not a string", () => {
      expect(() => parse({ ...base, photoUrl: 5 })).toThrow(
        InvalidRawDataError,
      )
    })

    it.each([undefined, 5, null])(
      "throws when the photo position is %j",
      (photoPosition) => {
        expect(() =>
          parse({ ...base, photoUrl: null, photoPosition }),
        ).toThrow(InvalidRawDataError)
      },
    )

    it("drops extra keys and keeps the order", () => {
      const entity = TimelineEventModel.fromRawData({
        ...validRaw,
        players: [
          { ...base, slug: "b", photoUrl: null, extra: 1 },
          { ...base, slug: "a", photoUrl: null },
        ],
      }).toEntity()

      expect(entity.players.map((p) => p.slug)).toEqual([
        "b",
        "a",
      ])
      expect(entity.players[0]).toEqual({
        ...base,
        slug: "b",
        photoUrl: null,
      })
    })
  })

  describe("linked contributor details", () => {
    const base = {
      slug: "c",
      name: "C",
      kind: "person",
      photoPosition: "50% 50%",
    }
    const parse = (contributor: Record<string, unknown>) =>
      TimelineEventModel.fromRawData({
        ...validRaw,
        contributors: [contributor],
      }).toEntity().contributors[0]

    it("reads kind, photo URL and position as given", () => {
      expect(
        parse({ ...base, photoUrl: "/c.webp" }),
      ).toEqual({
        ...base,
        photoUrl: "/c.webp",
      })
    })

    it.each([null, undefined])(
      "reads a %s photo URL as null",
      (photoUrl) => {
        expect(
          parse({ ...base, photoUrl }).photoUrl,
        ).toBeNull()
      },
    )

    it("throws when the photo URL is not a string", () => {
      expect(() => parse({ ...base, photoUrl: 5 })).toThrow(
        InvalidRawDataError,
      )
    })

    it.each(["kind", "photoPosition"])(
      "throws when %s is missing or not a string",
      (key) => {
        const missing: Record<string, unknown> = {
          ...base,
          photoUrl: null,
        }
        delete missing[key]

        expect(() => parse(missing)).toThrow(
          InvalidRawDataError,
        )
        expect(() =>
          parse({ ...base, photoUrl: null, [key]: 5 }),
        ).toThrow(InvalidRawDataError)
        expect(() =>
          parse({ ...base, photoUrl: null, [key]: null }),
        ).toThrow(InvalidRawDataError)
      },
    )

    it("drops extra keys and keeps the order", () => {
      const entity = TimelineEventModel.fromRawData({
        ...validRaw,
        contributors: [
          { ...base, slug: "b", photoUrl: null, extra: 1 },
          { ...base, slug: "a", photoUrl: null },
        ],
      }).toEntity()

      expect(
        entity.contributors.map((c) => c.slug),
      ).toEqual(["b", "a"])
      expect(entity.contributors[0]).toEqual({
        ...base,
        slug: "b",
        photoUrl: null,
      })
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
      {
        slug: "kgs",
        name: "KGS",
        kind: "organization",
        photoUrl: null,
        photoPosition: "50% 50%",
      },
      {
        slug: "demis-hassabis",
        name: "Demis Hassabis",
        kind: "person",
        photoUrl: "/portraits/dh.webp",
        photoPosition: "40% 20%",
      },
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
