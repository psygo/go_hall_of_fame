import { describe, expect, it } from "vitest"

import {
  collectErrors,
  isReservedSlug,
  isSafeAssetUrl,
  parseInteger,
  RESERVED_SLUGS,
} from "./validation"

describe("collectErrors", () => {
  it("keeps only the entries that have a message", () => {
    expect(
      collectErrors({
        name: "Enter a name.",
        year: undefined,
        slug: "Bad slug.",
      }),
    ).toEqual({ name: "Enter a name.", slug: "Bad slug." })
  })

  it("returns an empty object when nothing failed", () => {
    expect(
      collectErrors({ a: undefined, b: undefined }),
    ).toEqual({})
    expect(collectErrors({})).toEqual({})
  })

  it("keeps an empty-string message, since it is not undefined", () => {
    expect(collectErrors({ a: "" })).toEqual({ a: "" })
  })
})

describe("parseInteger", () => {
  it.each([
    ["0", 0],
    ["42", 42],
    ["-7", -7],
    ["  12  ", 12],
    ["007", 7],
  ])("parses %j as %d", (text, expected) => {
    expect(parseInteger(text)).toBe(expected)
  })

  it.each([
    "",
    "   ",
    "1.5",
    "1e3",
    "abc",
    "12a",
    "+5",
    "--1",
    "1 2",
    "0x10",
  ])("rejects %j", (text) => {
    expect(parseInteger(text)).toBeNull()
  })
})

describe("isSafeAssetUrl", () => {
  it.each([
    "/portraits/shusaku.webp",
    "/",
    "https://example.com/a.sgf",
    "https://example.com",
  ])("accepts %s", (url) => {
    expect(isSafeAssetUrl(url)).toBe(true)
  })

  it.each([
    ["javascript:", "javascript:alert(1)"],
    ["a protocol-relative URL", "//evil.example/x.png"],
    ["plain http", "http://example.com/x.png"],
    ["data:", "data:image/png;base64,AAAA"],
    ["a relative path", "portraits/x.webp"],
    ["spaces", "/portraits/my photo.webp"],
    ["a tab", "/portraits/a\tb"],
    ["a newline", "/portraits/a\nb"],
    ["leading whitespace", " /portraits/a.webp"],
    ["the empty string", ""],
    ["uppercase scheme", "HTTPS://example.com"],
  ])("rejects %s", (_label, url) => {
    expect(isSafeAssetUrl(url)).toBe(false)
  })

  it("accepts a URL of exactly 500 characters and rejects 501", () => {
    const base = "/"
    expect(isSafeAssetUrl(base + "a".repeat(499))).toBe(
      true,
    )
    expect(isSafeAssetUrl(base + "a".repeat(500))).toBe(
      false,
    )
  })
})

describe("isReservedSlug", () => {
  it("reserves new", () => {
    expect(RESERVED_SLUGS).toContain("new")
    expect(isReservedSlug("new")).toBe(true)
  })

  it.each(["news", "new-player", "", "New"])(
    "does not reserve %j",
    (slug) => {
      expect(isReservedSlug(slug)).toBe(false)
    },
  )
})

describe("isSafeAssetUrl backslashes", () => {
  it("rejects a backslash and control characters", () => {
    expect(isSafeAssetUrl("/\\evil.com")).toBe(false)
    expect(isSafeAssetUrl("/a\u0000b")).toBe(false)
  })
})
