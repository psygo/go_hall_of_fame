import { describe, expect, it } from "vitest"

import { findNeighborsOfGame, type Game } from "./game"

function buildGame(slug: string): Game {
  return {
    slug,
    year: 1900,
    name: slug,
    black: "Black",
    white: "White",
    result: "B+R",
    setting: "Setting",
    hook: "Hook",
    moment: "Moment",
    legacy: "Legacy",
    sgfUrl: null,
  }
}

describe("findNeighborsOfGame", () => {
  const games = [
    buildGame("a"),
    buildGame("b"),
    buildGame("c"),
  ]

  it("returns the previous and next games", () => {
    const neighbors = findNeighborsOfGame(games, "b")

    expect(neighbors?.previous.slug).toBe("a")
    expect(neighbors?.next.slug).toBe("c")
  })

  it("wraps around at both ends", () => {
    expect(
      findNeighborsOfGame(games, "a")?.previous.slug,
    ).toBe("c")
    expect(findNeighborsOfGame(games, "c")?.next.slug).toBe(
      "a",
    )
  })

  it("returns null when the slug is not in the list", () => {
    expect(findNeighborsOfGame(games, "zzz")).toBeNull()
  })
})
