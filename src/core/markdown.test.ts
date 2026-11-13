import { describe, expect, it } from "vitest"

import { stripMarkdown } from "./markdown"

describe("stripMarkdown", () => {
  it("keeps the text of links and images", () => {
    expect(
      stripMarkdown(
        "See [the game](https://x.example/a) ![alt](/i.png)!",
      ),
    ).toBe("See the game alt!")
  })

  it("removes emphasis, strike-through and inline code marks", () => {
    expect(
      stripMarkdown("**bold** _it_ ~~gone~~ `code`"),
    ).toBe("bold it gone code")
  })

  it("removes heading, quote and list markers", () => {
    expect(
      stripMarkdown(
        "# Title\n> quoted\n- one\n* two\n1. three",
      ),
    ).toBe("Title quoted one two three")
  })

  it("drops fenced code blocks", () => {
    expect(
      stripMarkdown("before\n```\ncode here\n```\nafter"),
    ).toBe("before after")
  })

  it("collapses whitespace and trims", () => {
    expect(stripMarkdown("  a \n\n  b\t c  ")).toBe("a b c")
  })

  it("returns an empty string for empty input", () => {
    expect(stripMarkdown("")).toBe("")
  })

  it("leaves plain text alone", () => {
    expect(stripMarkdown("Plain text, 3 - 2.")).toBe(
      "Plain text, 3 - 2.",
    )
  })
})
