import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import { TimelineEventModel } from "./timeline-event-model"

const validRaw = {
  year: 1612,
  title: "Founded",
  text: "Text",
}

describe("TimelineEventModel", () => {
  it("parses valid raw data", () => {
    const model = TimelineEventModel.fromRawData(validRaw)

    expect(model.year).toBe(1612)
    expect(model.title).toBe("Founded")
    expect(model.text).toBe("Text")
  })

  it("ignores extra columns such as the database id", () => {
    const entity = TimelineEventModel.fromRawData({
      ...validRaw,
      id: 9,
    }).toEntity()

    expect(entity).toEqual(validRaw)
  })

  it.each(["year", "title", "text"])(
    "throws when %s is missing",
    (key) => {
      const raw: Record<string, unknown> = { ...validRaw }
      delete raw[key]

      expect(() =>
        TimelineEventModel.fromRawData(raw),
      ).toThrow(InvalidRawDataError)
    },
  )

  it("throws when the year is not an integer", () => {
    expect(() =>
      TimelineEventModel.fromRawData({
        ...validRaw,
        year: "1612",
      }),
    ).toThrow('"year" must be an integer')
    expect(() =>
      TimelineEventModel.fromRawData({
        ...validRaw,
        year: 1.5,
      }),
    ).toThrow(InvalidRawDataError)
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
})
