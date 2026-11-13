import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import { ContributorModel } from "./contributor-model"

const validRaw = {
  slug: "kgs",
  name: "KGS",
  kind: "organization",
  role: "Server",
  period: "since 1999",
  bio: "Bio",
  photoUrl: "https://example.com/p.jpg",
  photoPosition: "center top",
  isDraft: false,
}

describe("ContributorModel", () => {
  it("parses valid raw data into a plain entity, dropping extra columns", () => {
    const entity = ContributorModel.fromRawData({
      ...validRaw,
      id: 3,
    }).toEntity()

    expect(entity).toEqual(validRaw)
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })

  it.each([null, undefined])(
    "reads a %s photo URL as null",
    (photoUrl) => {
      expect(
        ContributorModel.fromRawData({
          ...validRaw,
          photoUrl,
        }).photoUrl,
      ).toBeNull()
    },
  )

  it("throws when the photo URL is not a string", () => {
    expect(() =>
      ContributorModel.fromRawData({
        ...validRaw,
        photoUrl: 5,
      }),
    ).toThrow('"photoUrl" must be a string')
  })

  it.each([
    "slug",
    "name",
    "kind",
    "role",
    "period",
    "bio",
    "photoPosition",
    "isDraft",
  ])("throws when %s is missing", (key) => {
    const raw: Record<string, unknown> = { ...validRaw }
    delete raw[key]

    expect(() => ContributorModel.fromRawData(raw)).toThrow(
      InvalidRawDataError,
    )
  })

  it("throws on an unknown kind", () => {
    expect(() =>
      ContributorModel.fromRawData({
        ...validRaw,
        kind: "robot",
      }),
    ).toThrow(InvalidRawDataError)
  })

  it("throws when isDraft is not a boolean", () => {
    expect(() =>
      ContributorModel.fromRawData({
        ...validRaw,
        isDraft: "no",
      }),
    ).toThrow('"isDraft" must be a boolean')
  })

  it("throws when the raw data is not an object", () => {
    expect(() =>
      ContributorModel.fromRawData(null),
    ).toThrow("contributor must be an object")
  })
})
