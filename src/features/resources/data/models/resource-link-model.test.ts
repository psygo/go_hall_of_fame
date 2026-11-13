import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import { ResourceLinkModel } from "./resource-link-model"

describe("ResourceLinkModel", () => {
  it("parses a link into a plain entity", () => {
    const entity = ResourceLinkModel.fromRawData({
      id: 1,
      url: "https://a.example",
      description: "A",
    }).toEntity()

    expect(entity).toEqual({
      url: "https://a.example",
      description: "A",
    })
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })

  it("reads a null or missing description as null", () => {
    expect(
      ResourceLinkModel.fromRawData({
        url: "/a",
        description: null,
      }).description,
    ).toBeNull()
    expect(
      ResourceLinkModel.fromRawData({ url: "/a" })
        .description,
    ).toBeNull()
  })

  it("throws when the url is missing or the data is not an object", () => {
    expect(() =>
      ResourceLinkModel.fromRawData({ description: "x" }),
    ).toThrow(InvalidRawDataError)
    expect(() =>
      ResourceLinkModel.fromRawData(null),
    ).toThrow(InvalidRawDataError)
  })
})
