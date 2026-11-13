import { describe, expect, it } from "vitest"

import {
  RESOURCE_LIMITS,
  validateResourceRows,
} from "./resources"

function errorOf(
  rows: Parameters<typeof validateResourceRows>[0],
) {
  const result = validateResourceRows(rows)
  if (result.valid) throw new Error("expected invalid")
  return result.error
}

describe("validateResourceRows", () => {
  it("accepts no rows", () => {
    expect(validateResourceRows([])).toEqual({
      valid: true,
      links: [],
    })
  })

  it("trims, drops blank rows and turns a blank description into null", () => {
    expect(
      validateResourceRows([
        {
          title: " Site ",
          url: " https://a.example ",
          description: " A ",
        },
        { title: " ", url: "  ", description: " " },
        { title: "T", url: "/local", description: "" },
      ]),
    ).toEqual({
      valid: true,
      links: [
        {
          title: "Site",
          url: "https://a.example",
          description: "A",
        },
        { title: "T", url: "/local", description: null },
      ],
    })
  })

  it("requires a name when only a link is typed", () => {
    expect(
      errorOf([{ title: " ", url: "/a", description: "" }]),
    ).toBe("Each resource needs a name.")
  })

  it("rejects a name over the limit", () => {
    expect(
      errorOf([
        {
          title: "t".repeat(RESOURCE_LIMITS.title + 1),
          url: "/a",
          description: "",
        },
      ]),
    ).toBe(
      `Keep each name to ${RESOURCE_LIMITS.title} characters.`,
    )
  })

  it("requires a link when only a name is typed", () => {
    expect(
      errorOf([
        { title: "T", url: "", description: "Notes" },
      ]),
    ).toBe("Each resource needs a link.")
  })

  it.each([
    "http://a.example",
    "javascript:alert(1)",
    "//evil.example",
    "https://a.example/a b",
  ])("rejects the unsafe link %s", (url) => {
    expect(
      errorOf([{ title: "T", url, description: "" }]),
    ).toMatch(/is not a valid link/)
  })

  it("shortens a long invalid link in the message", () => {
    const url = "ftp://" + "a".repeat(100)

    expect(
      errorOf([{ title: "T", url, description: "" }]),
    ).not.toContain("a".repeat(60))
  })

  it("accepts a description at the limit and rejects one over", () => {
    const row = (length: number) => [
      {
        title: "T",
        url: "/a",
        description: "d".repeat(length),
      },
    ]

    expect(
      validateResourceRows(row(RESOURCE_LIMITS.description))
        .valid,
    ).toBe(true)
    expect(
      errorOf(row(RESOURCE_LIMITS.description + 1)),
    ).toMatch(/Keep each description/)
  })

  it("accepts the maximum number of rows and rejects one more", () => {
    const rows = (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        title: "T",
        url: `/r${i}`,
        description: "",
      }))

    expect(
      validateResourceRows(rows(RESOURCE_LIMITS.maxCount))
        .valid,
    ).toBe(true)
    expect(
      errorOf(rows(RESOURCE_LIMITS.maxCount + 1)),
    ).toBe(
      `Add at most ${RESOURCE_LIMITS.maxCount} resources.`,
    )
  })

  it("does not count blank rows toward the maximum", () => {
    const blanks = Array.from({ length: 50 }, () => ({
      title: "",
      url: "",
      description: "",
    }))

    expect(validateResourceRows(blanks).valid).toBe(true)
  })

  it("rejects a link over the limit with its own message", () => {
    expect(
      errorOf([
        {
          title: "T",
          url: "/" + "a".repeat(RESOURCE_LIMITS.url),
          description: "",
        },
      ]),
    ).toBe(
      `Keep each link to ${RESOURCE_LIMITS.url} characters.`,
    )
  })

  it("reports the first problem when several rows are wrong", () => {
    expect(
      errorOf([
        { title: "T", url: "", description: "x" },
        { title: "T", url: "http://bad", description: "" },
      ]),
    ).toBe("Each resource needs a link.")
  })
})
