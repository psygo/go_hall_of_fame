import { describe, expect, it } from "vitest"

import {
  asRecord,
  InvalidRawDataError,
  readArray,
  readInteger,
  readNullableString,
  readOneOf,
  readString,
} from "./raw-data"

describe("InvalidRawDataError", () => {
  it("is an Error with its own name and the given message", () => {
    const error = new InvalidRawDataError("broken")

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe("InvalidRawDataError")
    expect(error.message).toBe("broken")
  })
})

describe("asRecord", () => {
  it("returns a copy of a plain object", () => {
    const raw = { a: 1, b: "two" }

    const record = asRecord(raw, "Thing")

    expect(record).toEqual(raw)
    expect(record).not.toBe(raw)
  })

  it("accepts an empty object", () => {
    expect(asRecord({}, "Thing")).toEqual({})
  })

  it.each([
    ["an array", [1, 2]],
    ["null", null],
    ["undefined", undefined],
    ["a string", "text"],
    ["a number", 3],
    ["a boolean", true],
  ])("rejects %s", (_name, raw) => {
    expect(() => asRecord(raw, "Thing")).toThrow(
      InvalidRawDataError,
    )
    expect(() => asRecord(raw, "Thing")).toThrow(
      "Thing must be an object",
    )
  })
})

describe("readString", () => {
  it("returns a string value, including the empty string", () => {
    expect(readString({ key: "value" }, "key")).toBe(
      "value",
    )
    expect(readString({ key: "" }, "key")).toBe("")
  })

  it.each([
    ["missing", {}],
    ["null", { key: null }],
    ["a number", { key: 1 }],
    ["an object", { key: {} }],
  ])("throws when the value is %s", (_name, record) => {
    expect(() => readString(record, "key")).toThrow(
      InvalidRawDataError,
    )
    expect(() => readString(record, "key")).toThrow(
      '"key" must be a string',
    )
  })
})

describe("readNullableString", () => {
  it("returns the string when present", () => {
    expect(readNullableString({ key: "v" }, "key")).toBe(
      "v",
    )
  })

  it("returns null for null", () => {
    expect(
      readNullableString({ key: null }, "key"),
    ).toBeNull()
  })

  it("returns null when the key is missing (undefined)", () => {
    expect(readNullableString({}, "key")).toBeNull()
    expect(
      readNullableString({ key: undefined }, "key"),
    ).toBeNull()
  })

  it("throws when the value is neither a string nor nullish", () => {
    expect(() =>
      readNullableString({ key: 5 }, "key"),
    ).toThrow(InvalidRawDataError)
  })
})

describe("readInteger", () => {
  it("returns integers, including zero and negatives", () => {
    expect(readInteger({ n: 42 }, "n")).toBe(42)
    expect(readInteger({ n: 0 }, "n")).toBe(0)
    expect(readInteger({ n: -7 }, "n")).toBe(-7)
  })

  it.each([
    ["a float", { n: 1.5 }],
    ["NaN", { n: Number.NaN }],
    ["Infinity", { n: Number.POSITIVE_INFINITY }],
    ["a numeric string", { n: "3" }],
    ["null", { n: null }],
    ["missing", {}],
  ])("throws when the value is %s", (_name, record) => {
    expect(() => readInteger(record, "n")).toThrow(
      InvalidRawDataError,
    )
    expect(() => readInteger(record, "n")).toThrow(
      '"n" must be an integer',
    )
  })
})

describe("readOneOf", () => {
  const allowed = ["a", "b"] as const

  it("returns the value when it is allowed", () => {
    expect(readOneOf({ k: "b" }, "k", allowed)).toBe("b")
  })

  it("throws listing the allowed values when it is unknown", () => {
    expect(() =>
      readOneOf({ k: "c" }, "k", allowed),
    ).toThrow('"k" must be one of a, b')
  })

  it("throws when the value is not a string", () => {
    expect(() => readOneOf({ k: 1 }, "k", allowed)).toThrow(
      '"k" must be a string',
    )
  })

  it("throws when the key is missing", () => {
    expect(() => readOneOf({}, "k", allowed)).toThrow(
      InvalidRawDataError,
    )
  })
})

describe("readArray", () => {
  it("returns the array, including an empty one", () => {
    expect(readArray({ list: [1, 2] }, "list")).toEqual([
      1, 2,
    ])
    expect(readArray({ list: [] }, "list")).toEqual([])
  })

  it.each([
    ["an object", { list: {} }],
    ["a string", { list: "x" }],
    ["null", { list: null }],
    ["missing", {}],
  ])("throws when the value is %s", (_name, record) => {
    expect(() => readArray(record, "list")).toThrow(
      InvalidRawDataError,
    )
    expect(() => readArray(record, "list")).toThrow(
      '"list" must be an array',
    )
  })
})
