import { describe, expect, it } from "vitest"

import { excerpt, stripMarkdown } from "./markdown"

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

describe("excerpt", () => {
  it("returns short text unchanged, stripped of Markdown", () => {
    expect(excerpt("**Short** [text](/a)")).toBe(
      "Short text",
    )
  })

  it("returns text exactly at the limit unchanged", () => {
    expect(excerpt("a".repeat(20), 20)).toBe("a".repeat(20))
  })

  it("cuts at a word boundary and adds an ellipsis", () => {
    const result = excerpt(
      "one two three four five six",
      15,
    )

    expect(result).toBe("one two three…")
    expect(result.length).toBeLessThanOrEqual(15)
  })

  it("cuts mid-word when there is no usable space", () => {
    const result = excerpt("a".repeat(50), 10)

    expect(result).toBe(`${"a".repeat(9)}…`)
  })

  it("never exceeds the limit", () => {
    const text = "word ".repeat(100)

    expect(excerpt(text, 40).length).toBeLessThanOrEqual(40)
    expect(excerpt(text).length).toBeLessThanOrEqual(200)
  })
})
