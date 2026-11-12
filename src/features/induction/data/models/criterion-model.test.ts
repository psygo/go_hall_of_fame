import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import { CriterionModel } from "./criterion-model"

const validRaw = {
  position: 1,
  title: "Mastery",
  text: "Text",
}

describe("CriterionModel", () => {
  it("parses valid raw data", () => {
    const model = CriterionModel.fromRawData(validRaw)

    expect(model.position).toBe(1)
    expect(model.title).toBe("Mastery")
    expect(model.text).toBe("Text")
  })

  it.each(["position", "title", "text"])(
    "throws when %s is missing",
    (key) => {
      const raw: Record<string, unknown> = { ...validRaw }
      delete raw[key]

      expect(() => CriterionModel.fromRawData(raw)).toThrow(
        InvalidRawDataError,
      )
    },
  )

  it("throws when the position is not an integer", () => {
    expect(() =>
      CriterionModel.fromRawData({
        ...validRaw,
        position: "1",
      }),
    ).toThrow('"position" must be an integer')
  })

  it("throws when the raw data is an array", () => {
    expect(() => CriterionModel.fromRawData([])).toThrow(
      "criterion must be an object",
    )
  })

  it("converts to a plain entity equal to the fields", () => {
    const entity = CriterionModel.fromRawData({
      ...validRaw,
      id: 3,
    }).toEntity()

    expect(entity).toEqual(validRaw)
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })
})
