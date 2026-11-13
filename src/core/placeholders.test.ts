import { describe, expect, it } from "vitest"

import { fillPlaceholders } from "./placeholders"

describe("fillPlaceholders", () => {
  it("replaces a placeholder with a string or a number", () => {
    expect(
      fillPlaceholders("{playerCount} players", {
        playerCount: 12,
      }),
    ).toBe("12 players")
    expect(
      fillPlaceholders("Hi {name}", { name: "Go" }),
    ).toBe("Hi Go")
  })

  it("replaces every occurrence and several names", () => {
    expect(
      fillPlaceholders("{a}-{a}-{b}", { a: 1, b: 2 }),
    ).toBe("1-1-2")
  })

  it("leaves unknown placeholders as they are", () => {
    expect(
      fillPlaceholders("{a} {missing}", { a: 1 }),
    ).toBe("1 {missing}")
  })

  it("replaces a value of zero or an empty string", () => {
    expect(
      fillPlaceholders("{n}|{s}", { n: 0, s: "" }),
    ).toBe("0|")
  })

  it("leaves text without placeholders untouched", () => {
    expect(fillPlaceholders("plain text", { a: 1 })).toBe(
      "plain text",
    )
  })

  it("ignores braces that are not a word placeholder", () => {
    expect(
      fillPlaceholders("{} { a } {a-b}", {
        a: 1,
        "a-b": 2,
      }),
    ).toBe("{} { a } {a-b}")
  })

  it("ignores inherited properties such as toString", () => {
    expect(fillPlaceholders("{toString}", {})).toBe(
      "{toString}",
    )
  })
})
