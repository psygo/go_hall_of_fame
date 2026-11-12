import { describe, expect, it } from "vitest"

import { findCircularNeighbors } from "./circular-neighbors"

describe("findCircularNeighbors", () => {
  const items = ["a", "b", "c", "d"]

  it("returns the items before and after a middle index", () => {
    expect(findCircularNeighbors(items, 1)).toEqual({
      previous: "a",
      next: "c",
    })
  })

  it("wraps the previous neighbor to the last item at the start", () => {
    expect(findCircularNeighbors(items, 0)).toEqual({
      previous: "d",
      next: "b",
    })
  })

  it("wraps the next neighbor to the first item at the end", () => {
    expect(findCircularNeighbors(items, 3)).toEqual({
      previous: "c",
      next: "a",
    })
  })

  it("returns the single item as both neighbors of a one-item list", () => {
    expect(findCircularNeighbors(["only"], 0)).toEqual({
      previous: "only",
      next: "only",
    })
  })

  it("returns the other item as both neighbors in a two-item list", () => {
    expect(findCircularNeighbors(["x", "y"], 0)).toEqual({
      previous: "y",
      next: "y",
    })
  })

  it("returns null when the index is negative (item not found)", () => {
    expect(findCircularNeighbors(items, -1)).toBeNull()
  })

  it("returns null when the index is past the end", () => {
    expect(findCircularNeighbors(items, 4)).toBeNull()
  })

  it("returns null for an empty list", () => {
    expect(findCircularNeighbors([], 0)).toBeNull()
  })
})
