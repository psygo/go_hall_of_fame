import { describe, expect, it } from "vitest"

import {
  findNeighborsOfGame,
  searchGames,
  DEFAULT_GAME_SORT,
  GAME_SORTS,
  highlightMoveOf,
  DEFAULT_HIGHLIGHT_MOVE,
  sgfSourceOf,
  sortGames,
  type Game,
} from "./game"

function buildGame(
  slug: string,
  overrides: Partial<Game> = {},
): Game {
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
    blackPlayerSlug: null,
    whitePlayerSlug: null,
    sgfUrl: null,
    hasUploadedSgf: false,
    highlightMove: null,
    featured: false,
    sequence: 0,
    ...overrides,
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

describe("sgfSourceOf", () => {
  it("prefers the uploaded text over a link", () => {
    expect(
      sgfSourceOf(
        buildGame("a", {
          hasUploadedSgf: true,
          sgfUrl: "https://example.com/a.sgf",
        }),
      ),
    ).toBe("/games/a/sgf")
  })

  it("falls back to the link, then to null", () => {
    expect(
      sgfSourceOf(buildGame("a", { sgfUrl: "/sgf/a.sgf" })),
    ).toBe("/sgf/a.sgf")
    expect(sgfSourceOf(buildGame("a"))).toBeNull()
  })
})

describe("searchGames", () => {
  const games = [
    buildGame("a", { name: "Ear-Reddening", year: 1846 }),
    buildGame("b", {
      name: "Move 78",
      black: "Lee Sedol",
      year: 2016,
    }),
  ]

  it("returns everything for a blank query", () => {
    expect(searchGames(games, "  ")).toEqual(games)
  })

  it("matches the name, a player or the year", () => {
    expect(searchGames(games, "ear")).toEqual([games[0]])
    expect(searchGames(games, "sedol")).toEqual([games[1]])
    expect(searchGames(games, "1846")).toEqual([games[0]])
  })

  it("needs every word to match", () => {
    expect(searchGames(games, "lee 1846")).toEqual([])
  })
})

describe("sortGames", () => {
  const games = [
    buildGame("a", { name: "Zeta" }),
    buildGame("b", { name: "alpha" }),
    buildGame("c", { name: "Beta" }),
  ]

  it("keeps the chronological order for oldest", () => {
    expect(sortGames(games, "oldest")).toEqual(games)
  })

  it("reverses for newest without mutating the input", () => {
    expect(
      sortGames(games, "newest").map((g) => g.slug),
    ).toEqual(["c", "b", "a"])
    expect(games.map((g) => g.slug)).toEqual([
      "a",
      "b",
      "c",
    ])
  })

  it("sorts by name ignoring case", () => {
    expect(
      sortGames(games, "name").map((g) => g.name),
    ).toEqual(["alpha", "Beta", "Zeta"])
  })
})

describe("highlightMoveOf", () => {
  it("uses the game's move, or the default of 50", () => {
    expect(highlightMoveOf({ highlightMove: 78 })).toBe(78)
    expect(highlightMoveOf({ highlightMove: null })).toBe(
      DEFAULT_HIGHLIGHT_MOVE,
    )
    expect(DEFAULT_HIGHLIGHT_MOVE).toBe(50)
  })
})

describe("sort defaults", () => {
  it("lists newest first and defaults to it", () => {
    expect(GAME_SORTS).toEqual(["newest", "oldest", "name"])
    expect(DEFAULT_GAME_SORT).toBe("newest")
  })
})
