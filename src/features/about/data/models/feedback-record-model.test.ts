import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import { FeedbackRecordModel } from "./feedback-record-model"

const createdAt = new Date("2026-01-02T03:04:05Z")
const validRaw = {
  id: 2,
  email: "a@b.example",
  description: "Hi",
  isRead: false,
  createdAt,
}

describe("FeedbackRecordModel", () => {
  it("parses valid raw data into a plain entity", () => {
    const entity = FeedbackRecordModel.fromRawData({
      ...validRaw,
      extra: "x",
    }).toEntity()

    expect(entity).toEqual(validRaw)
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })

  it.each([
    "id",
    "email",
    "description",
    "isRead",
    "createdAt",
  ])("throws when %s is missing", (key) => {
    const raw: Record<string, unknown> = { ...validRaw }
    delete raw[key]

    expect(() =>
      FeedbackRecordModel.fromRawData(raw),
    ).toThrow(InvalidRawDataError)
  })

  it("throws on wrong types", () => {
    expect(() =>
      FeedbackRecordModel.fromRawData({
        ...validRaw,
        id: "2",
      }),
    ).toThrow('"id" must be an integer')
    expect(() =>
      FeedbackRecordModel.fromRawData({
        ...validRaw,
        isRead: "no",
      }),
    ).toThrow(InvalidRawDataError)
  })

  it("throws when the raw data is not an object", () => {
    expect(() =>
      FeedbackRecordModel.fromRawData(null),
    ).toThrow("feedback must be an object")
  })
})
