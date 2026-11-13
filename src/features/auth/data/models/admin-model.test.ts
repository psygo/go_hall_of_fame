import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import {
  AdminCredentialsModel,
  AdminModel,
} from "./admin-model"

const validAdmin = {
  id: 1,
  name: "Ada Lovelace",
  email: "ada@example.com",
}

const lockedUntil = new Date("2026-05-01T12:15:00Z")

const validCredentials = {
  ...validAdmin,
  passwordHash: "scrypt$16384$8$1$c2FsdA==$a2V5",
  failedAttempts: 2,
  lockedUntil,
}

function without(
  raw: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const copy = { ...raw }
  delete copy[key]
  return copy
}

describe("AdminModel", () => {
  it("parses valid raw data", () => {
    const model = AdminModel.fromRawData(validAdmin)

    expect(model.id).toBe(1)
    expect(model.name).toBe("Ada Lovelace")
    expect(model.email).toBe("ada@example.com")
  })

  it.each(["id", "name", "email"])(
    "throws when %s is missing",
    (key) => {
      expect(() =>
        AdminModel.fromRawData(without(validAdmin, key)),
      ).toThrow(InvalidRawDataError)
    },
  )

  it("throws when the id is not an integer", () => {
    expect(() =>
      AdminModel.fromRawData({ ...validAdmin, id: "1" }),
    ).toThrow('"id" must be an integer')
  })

  it("throws when the raw data is not an object", () => {
    expect(() => AdminModel.fromRawData(null)).toThrow(
      "admin must be an object",
    )
  })

  it("never exposes the password hash through the entity", () => {
    const entity = AdminModel.fromRawData({
      ...validCredentials,
    }).toEntity()

    expect(entity).toEqual(validAdmin)
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })
})

describe("AdminCredentialsModel", () => {
  it("parses valid raw data", () => {
    const model = AdminCredentialsModel.fromRawData(
      validCredentials,
    )

    expect(model.admin).toEqual(validAdmin)
    expect(model.passwordHash).toBe(
      validCredentials.passwordHash,
    )
    expect(model.failedAttempts).toBe(2)
    expect(model.lockedUntil).toBe(lockedUntil)
  })

  it.each([
    ["null", null],
    ["undefined", undefined],
  ])("reads lockedUntil %s as null", (_label, value) => {
    expect(
      AdminCredentialsModel.fromRawData({
        ...validCredentials,
        lockedUntil: value,
      }).lockedUntil,
    ).toBeNull()
  })

  it("reads a missing lockedUntil as null", () => {
    expect(
      AdminCredentialsModel.fromRawData(
        without(validCredentials, "lockedUntil"),
      ).lockedUntil,
    ).toBeNull()
  })

  it.each([
    "id",
    "name",
    "email",
    "passwordHash",
    "failedAttempts",
  ])("throws when %s is missing", (key) => {
    expect(() =>
      AdminCredentialsModel.fromRawData(
        without(validCredentials, key),
      ),
    ).toThrow(InvalidRawDataError)
  })

  it.each([
    ["a string", "soon"],
    ["an invalid date", new Date("nope")],
    ["a number", 5],
  ])("throws when lockedUntil is %s", (_label, value) => {
    expect(() =>
      AdminCredentialsModel.fromRawData({
        ...validCredentials,
        lockedUntil: value,
      }),
    ).toThrow('"lockedUntil" must be a valid date')
  })

  it("throws when failedAttempts is not an integer", () => {
    expect(() =>
      AdminCredentialsModel.fromRawData({
        ...validCredentials,
        failedAttempts: 1.5,
      }),
    ).toThrow('"failedAttempts" must be an integer')
  })

  it("throws when the raw data is not an object", () => {
    expect(() =>
      AdminCredentialsModel.fromRawData([]),
    ).toThrow("admin must be an object")
  })

  it("converts to a plain entity", () => {
    const entity = AdminCredentialsModel.fromRawData(
      validCredentials,
    ).toEntity()

    expect(entity).toEqual({
      admin: validAdmin,
      passwordHash: validCredentials.passwordHash,
      failedAttempts: 2,
      lockedUntil,
    })
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })
})
