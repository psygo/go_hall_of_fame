import { describe, expect, it } from "vitest"

import {
  matchesQuery,
  paginate,
  readChoice,
  readPageParam,
  readParam,
  readSearchParam,
  sliceFrom,
} from "./list-query"

const numbers = Array.from({ length: 25 }, (_, i) => i + 1)

describe("paginate", () => {
  it("returns the requested page with the totals", () => {
    expect(paginate(numbers, 2, 10)).toEqual({
      items: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      page: 2,
      pageCount: 3,
      total: 25,
    })
  })

  it("returns a shorter last page", () => {
    expect(paginate(numbers, 3, 10).items).toEqual([
      21, 22, 23, 24, 25,
    ])
  })

  it("has one page when the list fits exactly", () => {
    expect(
      paginate(numbers.slice(0, 10), 1, 10).pageCount,
    ).toBe(1)
    expect(
      paginate(numbers.slice(0, 11), 1, 10).pageCount,
    ).toBe(2)
  })

  it("clamps a page past the end to the last page", () => {
    const result = paginate(numbers, 99, 10)

    expect(result.page).toBe(3)
    expect(result.items).toHaveLength(5)
  })

  it.each([0, -3])(
    "clamps page %s to the first page",
    (page) => {
      expect(paginate(numbers, page, 10).page).toBe(1)
    },
  )

  it("gives one empty page for an empty list", () => {
    expect(paginate([], 4, 10)).toEqual({
      items: [],
      page: 1,
      pageCount: 1,
      total: 0,
    })
  })
})

describe("sliceFrom", () => {
  it("returns a chunk and where the next one starts", () => {
    expect(sliceFrom(numbers, 0, 10)).toEqual({
      items: numbers.slice(0, 10),
      total: 25,
      nextOffset: 10,
    })
  })

  it("has no next offset at the end", () => {
    expect(sliceFrom(numbers, 20, 10)).toEqual({
      items: [21, 22, 23, 24, 25],
      total: 25,
      nextOffset: null,
    })
  })

  it("has no next offset when the chunk ends exactly at the end", () => {
    expect(sliceFrom(numbers, 15, 10).nextOffset).toBeNull()
  })

  it("returns nothing past the end", () => {
    expect(sliceFrom(numbers, 100, 10)).toEqual({
      items: [],
      total: 25,
      nextOffset: null,
    })
  })

  it("treats a negative offset as 0", () => {
    expect(sliceFrom(numbers, -5, 10).items).toEqual(
      numbers.slice(0, 10),
    )
  })

  it("handles an empty list", () => {
    expect(sliceFrom([], 0, 10)).toEqual({
      items: [],
      total: 0,
      nextOffset: null,
    })
  })
})

describe("matchesQuery", () => {
  it("matches everything for a blank query", () => {
    expect(matchesQuery(["a"], "")).toBe(true)
    expect(matchesQuery([], "   ")).toBe(true)
  })

  it("ignores case", () => {
    expect(
      matchesQuery(["Honinbo Shusaku"], "SHUSAKU"),
    ).toBe(true)
  })

  it("ignores accents on both sides", () => {
    expect(
      matchesQuery(["Café Müller"], "cafe muller"),
    ).toBe(true)
    expect(matchesQuery(["Cafe"], "café")).toBe(true)
  })

  it("requires every word, in any field and any order", () => {
    const fields = ["Lee Sedol", "Korea"]

    expect(matchesQuery(fields, "korea lee")).toBe(true)
    expect(matchesQuery(fields, "lee japan")).toBe(false)
  })

  it("matches parts of words and non-Latin text", () => {
    expect(matchesQuery(["Shusaku", "秀策"], "shu")).toBe(
      true,
    )
    expect(matchesQuery(["Shusaku", "秀策"], "秀")).toBe(
      true,
    )
  })

  it("does not match a word absent from every field", () => {
    expect(matchesQuery(["a"], "b")).toBe(false)
  })
})

describe("readParam", () => {
  it("returns a string, the first of an array, or empty", () => {
    expect(readParam("x")).toBe("x")
    expect(readParam(["a", "b"])).toBe("a")
    expect(readParam([])).toBe("")
    expect(readParam(undefined)).toBe("")
  })
})

describe("readPageParam", () => {
  it.each([
    ["3", 3],
    ["1", 1],
    ["000012", 12],
    [["4", "9"], 4],
  ])("reads %j as %i", (value, expected) => {
    expect(readPageParam(value)).toBe(expected)
  })

  it.each([
    undefined,
    "",
    "0",
    "-2",
    "1.5",
    "2e3",
    "0x10",
    "abc",
    " 3",
    "3 ",
    "1234567",
    "９",
    [],
  ])("falls back to 1 for %j", (value) => {
    expect(readPageParam(value)).toBe(1)
  })
})

describe("readChoice", () => {
  const options = ["a", "b"] as const

  it("returns the value when allowed", () => {
    expect(readChoice("b", options, "a")).toBe("b")
  })

  it.each([undefined, "", "c", "B", "__proto__"])(
    "returns the fallback for %j",
    (value) => {
      expect(readChoice(value, options, "a")).toBe("a")
    },
  )
})

describe("readSearchParam", () => {
  it("trims the text", () => {
    expect(readSearchParam("  go  ")).toBe("go")
  })

  it("caps a long text at 80 characters", () => {
    expect(readSearchParam("a".repeat(500))).toHaveLength(
      80,
    )
  })

  it("is empty for a missing parameter", () => {
    expect(readSearchParam(undefined)).toBe("")
  })
})
