import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import { PasswordResetRecordModel } from "./password-reset-record-model"

const raw = {
  id: 1,
  adminId: 2,
  expiresAt: new Date("2026-01-01T12:00:00Z"),
  usedAt: null,
}

describe("PasswordResetRecordModel", () => {
  it("parses valid raw data into a plain entity", () => {
    const entity =
      PasswordResetRecordModel.fromRawData(raw).toEntity()

    expect(entity).toEqual(raw)
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })

  it("reads a used link's date", () => {
    const usedAt = new Date("2026-01-01T12:30:00Z")

    expect(
      PasswordResetRecordModel.fromRawData({
        ...raw,
        usedAt,
      }).usedAt,
    ).toEqual(usedAt)
  })

  it.each(["id", "adminId", "expiresAt"])(
    "throws when %s is missing",
    (key) => {
      const copy: Record<string, unknown> = { ...raw }
      delete copy[key]

      expect(() =>
        PasswordResetRecordModel.fromRawData(copy),
      ).toThrow(InvalidRawDataError)
    },
  )

  it("throws when the raw data is not an object", () => {
    expect(() =>
      PasswordResetRecordModel.fromRawData(null),
    ).toThrow(InvalidRawDataError)
  })
})
