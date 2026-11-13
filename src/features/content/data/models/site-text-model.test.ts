import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import { SiteTextModel } from "./site-text-model"

describe("SiteTextModel", () => {
  it("parses valid raw data", () => {
    const model = SiteTextModel.fromRawData({
      key: "home.title",
      value: "Hello",
    })

    expect(model.key).toBe("home.title")
    expect(model.value).toBe("Hello")
  })

  it("accepts an empty value", () => {
    expect(
      SiteTextModel.fromRawData({ key: "k", value: "" })
        .value,
    ).toBe("")
  })

  it.each(["key", "value"])(
    "throws when %s is missing",
    (key) => {
      const raw: Record<string, unknown> = {
        key: "k",
        value: "v",
      }
      delete raw[key]

      expect(() => SiteTextModel.fromRawData(raw)).toThrow(
        InvalidRawDataError,
      )
    },
  )

  it("throws when the value is not a string", () => {
    expect(() =>
      SiteTextModel.fromRawData({ key: "k", value: 1 }),
    ).toThrow('"value" must be a string')
  })

  it("throws when the raw data is not an object", () => {
    expect(() => SiteTextModel.fromRawData("x")).toThrow(
      "site text must be an object",
    )
  })

  it("ignores extra columns such as updatedAt when converting", () => {
    const entity = SiteTextModel.fromRawData({
      key: "k",
      value: "v",
      updatedAt: new Date(),
    }).toEntity()

    expect(entity).toEqual({ key: "k", value: "v" })
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })
})
