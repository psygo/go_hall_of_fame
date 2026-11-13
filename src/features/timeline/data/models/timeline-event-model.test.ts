import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import { TimelineEventModel } from "./timeline-event-model"

const validRaw = {
  id: 4,
  year: "c. 1612",
  title: "Founded",
  text: "Text",
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

    expect(entity).toEqual({ ...validRaw, game: null })
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

  it("throws when the raw data is not an object", () => {
    expect(() =>
      TimelineEventModel.fromRawData(null),
    ).toThrow("timeline event must be an object")
  })

  it("converts to a plain entity equal to the fields", () => {
    const entity =
      TimelineEventModel.fromRawData(validRaw).toEntity()

    expect(entity).toEqual({ ...validRaw, game: null })
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })
  it("has no game when gameSlug is null or missing", () => {
    expect(
      TimelineEventModel.fromRawData(validRaw).game,
    ).toBeNull()
    expect(
      TimelineEventModel.fromRawData({
        ...validRaw,
        gameSlug: null,
        gameName: null,
      }).game,
    ).toBeNull()
  })

  it("reads the linked game", () => {
    expect(
      TimelineEventModel.fromRawData({
        ...validRaw,
        gameSlug: "ear-reddening",
        gameName: "Ear-Reddening",
      }).toEntity().game,
    ).toEqual({
      slug: "ear-reddening",
      name: "Ear-Reddening",
    })
  })

  it("throws when a game slug comes without a name", () => {
    expect(() =>
      TimelineEventModel.fromRawData({
        ...validRaw,
        gameSlug: "ear-reddening",
      }),
    ).toThrow(InvalidRawDataError)
  })
})
