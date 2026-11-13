import { describe, expect, it } from "vitest"

import {
  formatTags,
  parseTags,
  TAG_LIMITS,
  validateTags,
} from "./tags"

describe("parseTags", () => {
  it("returns an empty list for blank text", () => {
    expect(parseTags("")).toEqual([])
    expect(parseTags(" , ,, ")).toEqual([])
  })

  it("trims, collapses inner spaces and drops blanks", () => {
    expect(parseTags(" ko ,  big   win ,, ")).toEqual([
      "ko",
      "big win",
    ])
  })

  it("drops repeats ignoring case and keeps the first spelling", () => {
    expect(parseTags("Ko, ko, KO, seki")).toEqual([
      "Ko",
      "seki",
    ])
  })
})

describe("validateTags", () => {
  it("accepts blank text as an empty list", () => {
    expect(validateTags("  ")).toEqual({
      valid: true,
      tags: [],
    })
  })

  it("accepts the maximum number of tags and rejects one more", () => {
    const make = (count: number) =>
      Array.from({ length: count }, (_, i) => `t${i}`).join(
        ",",
      )

    expect(
      validateTags(make(TAG_LIMITS.maxTags)).valid,
    ).toBe(true)
    expect(
      validateTags(make(TAG_LIMITS.maxTags + 1)),
    ).toEqual({
      valid: false,
      error: `Use at most ${TAG_LIMITS.maxTags} tags.`,
    })
  })

  it("does not count repeats toward the maximum", () => {
    expect(validateTags("a,A,a,a,a,a,a,a,a,a").valid).toBe(
      true,
    )
  })

  it("accepts a tag at the length limit and rejects one over", () => {
    expect(
      validateTags("x".repeat(TAG_LIMITS.maxLength)).valid,
    ).toBe(true)
    expect(
      validateTags("x".repeat(TAG_LIMITS.maxLength + 1)),
    ).toEqual({
      valid: false,
      error: `Keep each tag to ${TAG_LIMITS.maxLength} characters or fewer.`,
    })
  })
})

describe("formatTags", () => {
  it("joins with commas and round-trips through parseTags", () => {
    expect(formatTags(["a", "b c"])).toBe("a, b c")
    expect(parseTags(formatTags(["a", "b c"]))).toEqual([
      "a",
      "b c",
    ])
    expect(formatTags([])).toBe("")
  })
})
