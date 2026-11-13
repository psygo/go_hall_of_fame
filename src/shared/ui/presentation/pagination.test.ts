import { describe, expect, it } from "vitest"

import { visiblePages } from "./pagination"

describe("visiblePages", () => {
  it("shows the only page", () => {
    expect(visiblePages(1, 1)).toEqual([1])
  })

  it("shows every page of a short list", () => {
    expect(visiblePages(3, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it("keeps the first and last page with a window around the current one", () => {
    expect(visiblePages(10, 20)).toEqual([
      1, 8, 9, 10, 11, 12, 20,
    ])
  })

  it("does not go below 1 or past the last page at the edges", () => {
    expect(visiblePages(1, 20)).toEqual([1, 2, 3, 20])
    expect(visiblePages(20, 20)).toEqual([1, 18, 19, 20])
  })
})
