import { describe, expect, it } from "vitest"

import { isValidSlug, slugify } from "./slugify"

describe("slugify", () => {
  it.each([
    ["Honinbo Shusaku", "honinbo-shusaku"],
    ["  Lee   Sedol  ", "lee-sedol"],
    [
      "AlphaGo vs. Lee Sedol: Game 4",
      "alphago-vs-lee-sedol-game-4",
    ],
    ["The Ear-Reddening Game", "the-ear-reddening-game"],
    ["Cho Chikun!!!", "cho-chikun"],
    ["---a---b---", "a-b"],
    ["Café Zoë", "cafe-zoe"],
    ["a_b", "a-b"],
    ["ABC123", "abc123"],
  ])("turns %j into %j", (text, expected) => {
    expect(slugify(text)).toBe(expected)
  })

  it.each([
    ["a CJK-only name", "本因坊秀策"],
    ["the empty string", ""],
    ["only punctuation", "!!! ???"],
  ])("returns an empty string for %s", (_label, text) => {
    expect(slugify(text)).toBe("")
  })

  it("keeps the Latin part of a mixed name", () => {
    expect(slugify("Shusaku 秀策")).toBe("shusaku")
  })
})

describe("isValidSlug", () => {
  it.each([
    "a",
    "shusaku",
    "alphago-game-4",
    "a1-b2-c3",
    "123",
  ])("accepts %s", (slug) => {
    expect(isValidSlug(slug)).toBe(true)
  })

  it.each([
    "",
    "Shusaku",
    "-a",
    "a-",
    "a--b",
    "a b",
    "a_b",
    "é",
    "a/b",
  ])("rejects %j", (slug) => {
    expect(isValidSlug(slug)).toBe(false)
  })

  it("accepts 80 characters and rejects 81", () => {
    expect(isValidSlug("a".repeat(80))).toBe(true)
    expect(isValidSlug("a".repeat(81))).toBe(false)
  })
})
