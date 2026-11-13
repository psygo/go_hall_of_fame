import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import { NominationRecordModel } from "./nomination-record-model"

const createdAt = new Date("2026-01-02T03:04:05Z")

const validRaw = {
  id: 8,
  name: "Shusaku",
  category: "player",
  email: "fan@example.com",
  caseForInduction: "Reasons",
  status: "pending",
  createdAt,
}

function without(
  raw: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const copy = { ...raw }
  delete copy[key]
  return copy
}

describe("NominationRecordModel", () => {
  it("parses valid raw data", () => {
    const model =
      NominationRecordModel.fromRawData(validRaw)

    expect(model.id).toBe(8)
    expect(model.category).toBe("player")
    expect(model.status).toBe("pending")
    expect(model.createdAt).toBe(createdAt)
  })

  it.each(["player", "game"])(
    "accepts the category %s",
    (category) => {
      expect(
        NominationRecordModel.fromRawData({
          ...validRaw,
          category,
        }).category,
      ).toBe(category)
    },
  )

  it.each(["pending", "accepted", "declined"])(
    "accepts the status %s",
    (status) => {
      expect(
        NominationRecordModel.fromRawData({
          ...validRaw,
          status,
        }).status,
      ).toBe(status)
    },
  )

  it.each(Object.keys(validRaw))(
    "throws when %s is missing",
    (key) => {
      expect(() =>
        NominationRecordModel.fromRawData(
          without(validRaw, key),
        ),
      ).toThrow(InvalidRawDataError)
    },
  )

  it("throws on an unknown category", () => {
    expect(() =>
      NominationRecordModel.fromRawData({
        ...validRaw,
        category: "timeline",
      }),
    ).toThrow('"category" must be one of player, game')
  })

  it("throws on an unknown status", () => {
    expect(() =>
      NominationRecordModel.fromRawData({
        ...validRaw,
        status: "archived",
      }),
    ).toThrow(
      '"status" must be one of pending, accepted, declined',
    )
  })

  it.each([
    ["a string", "2026-01-02"],
    ["an invalid date", new Date("x")],
    ["null", null],
  ])("throws when createdAt is %s", (_label, value) => {
    expect(() =>
      NominationRecordModel.fromRawData({
        ...validRaw,
        createdAt: value,
      }),
    ).toThrow('"createdAt" must be a valid date')
  })

  it("throws when the id is not an integer", () => {
    expect(() =>
      NominationRecordModel.fromRawData({
        ...validRaw,
        id: "8",
      }),
    ).toThrow('"id" must be an integer')
  })

  it("throws when the raw data is not an object", () => {
    expect(() =>
      NominationRecordModel.fromRawData(5),
    ).toThrow("nomination must be an object")
  })

  it("converts to a plain entity equal to the fields", () => {
    const entity =
      NominationRecordModel.fromRawData(validRaw).toEntity()

    expect(entity).toEqual(validRaw)
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })
})
