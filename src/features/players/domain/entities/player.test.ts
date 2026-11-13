import { describe, expect, it } from "vitest"

import {
  filterPlayersByCountry,
  findNeighborsOfPlayer,
  isCountry,
  searchPlayers,
  sortPlayers,
  compareChronologically,
  type Country,
  type Player,
  DEFAULT_PLAYER_SORT,
  PLAYER_SORTS,
  PLAYER_SORT_LABELS,
} from "./player"

function buildPlayer(
  slug: string,
  country: Country = "Japan",
  overrides: Partial<Player> = {},
): Player {
  return {
    slug,
    inductionNumber: 1,
    birthYear: 1900,
    name: slug,
    nativeName: slug,
    country,
    years: "1900-1950",
    distinction: "Master",
    bio: "Bio",
    photoUrl: null,
    photoPosition: "center",
    tags: [],
    isDraft: false,
    ...overrides,
  }
}

describe("isCountry", () => {
  it.each(["Japan", "China", "Korea", "Others"])(
    "accepts %s",
    (value) => {
      expect(isCountry(value)).toBe(true)
    },
  )

  it.each([
    ["an unknown country", "France"],
    ["a different case", "japan"],
    ["the empty string", ""],
    ["undefined", undefined],
    ["null", null],
    ["a number", 1],
    ["an array holding a country", ["Japan"]],
  ])("rejects %s", (_name, value) => {
    expect(isCountry(value)).toBe(false)
  })
})

describe("filterPlayersByCountry", () => {
  const players = [
    buildPlayer("a", "Japan"),
    buildPlayer("b", "China"),
    buildPlayer("c", "Japan"),
  ]

  it("returns every player when the country is null", () => {
    expect(filterPlayersByCountry(players, null)).toEqual(
      players,
    )
  })

  it("keeps only the players of the country, in order", () => {
    expect(
      filterPlayersByCountry(players, "Japan").map(
        (player) => player.slug,
      ),
    ).toEqual(["a", "c"])
  })

  it("returns an empty list when nobody is from the country", () => {
    expect(
      filterPlayersByCountry(players, "Korea"),
    ).toEqual([])
  })
})

describe("findNeighborsOfPlayer", () => {
  const players = [
    buildPlayer("a"),
    buildPlayer("b"),
    buildPlayer("c"),
  ]

  it("returns the previous and next players", () => {
    const neighbors = findNeighborsOfPlayer(players, "b")

    expect(neighbors?.previous.slug).toBe("a")
    expect(neighbors?.next.slug).toBe("c")
  })

  it("wraps around at both ends", () => {
    expect(
      findNeighborsOfPlayer(players, "a")?.previous.slug,
    ).toBe("c")
    expect(
      findNeighborsOfPlayer(players, "c")?.next.slug,
    ).toBe("a")
  })

  it("returns null when the slug is not in the list", () => {
    expect(findNeighborsOfPlayer(players, "zzz")).toBeNull()
  })
})

describe("searchPlayers", () => {
  const players = [
    buildPlayer("a", "Japan", {
      name: "Honinbo Shusaku",
      nativeName: "秀策",
    }),
    buildPlayer("b", "Korea", {
      name: "Lee Sedol",
      distinction: "Beat AlphaGo once",
    }),
  ]

  it("returns everyone for a blank query", () => {
    expect(searchPlayers(players, "")).toEqual(players)
  })

  it("matches name, native name, country and distinction", () => {
    expect(searchPlayers(players, "shusaku")).toEqual([
      players[0],
    ])
    expect(searchPlayers(players, "秀策")).toEqual([
      players[0],
    ])
    expect(searchPlayers(players, "korea")).toEqual([
      players[1],
    ])
    expect(searchPlayers(players, "alphago")).toEqual([
      players[1],
    ])
  })

  it("matches a tag", () => {
    const tagged = [
      buildPlayer("a", "Japan", { tags: ["Ko Fighter"] }),
      buildPlayer("b"),
    ]

    expect(searchPlayers(tagged, "fighter")).toEqual([
      tagged[0],
    ])
  })

  it("needs every word to match", () => {
    expect(searchPlayers(players, "lee shusaku")).toEqual(
      [],
    )
  })
})

describe("compareChronologically", () => {
  const a = buildPlayer("a", "Japan", {
    birthYear: 1800,
    inductionNumber: 5,
  })
  const b = buildPlayer("b", "Japan", {
    birthYear: 1900,
    inductionNumber: 1,
  })
  const sameYear = buildPlayer("c", "Japan", {
    birthYear: 1800,
    inductionNumber: 9,
  })

  it("orders by birth year first", () => {
    expect(compareChronologically(a, b)).toBeLessThan(0)
    expect(compareChronologically(b, a)).toBeGreaterThan(0)
  })

  it("breaks ties by induction number", () => {
    expect(
      compareChronologically(a, sameYear),
    ).toBeLessThan(0)
    expect(
      compareChronologically(sameYear, a),
    ).toBeGreaterThan(0)
  })

  it("is zero for the same birth year and number", () => {
    expect(compareChronologically(a, a)).toBe(0)
  })
})

describe("sortPlayers", () => {
  // Deliberately not in any of the sorted orders.
  const players = [
    buildPlayer("b", "China", {
      name: "alice",
      inductionNumber: 4,
      birthYear: 1900,
    }),
    buildPlayer("d", "Korea", {
      name: "Zed",
      inductionNumber: 1,
      birthYear: 1990,
    }),
    buildPlayer("a", "China", {
      name: "Bob",
      inductionNumber: 3,
      birthYear: 1800,
    }),
    buildPlayer("c", "Japan", {
      name: "Cat",
      inductionNumber: 2,
      birthYear: 1900,
    }),
  ]
  const slugs = (list: readonly Player[]) =>
    list.map((player) => player.slug)

  it("sorts chronologically: birth year, then induction number", () => {
    expect(
      slugs(sortPlayers(players, "chronological")),
    ).toEqual(["a", "c", "b", "d"])
  })

  it("sorts youngest first as the reverse of chronological", () => {
    expect(slugs(sortPlayers(players, "youngest"))).toEqual(
      ["d", "b", "c", "a"],
    )
  })

  it("sorts by induction number ascending", () => {
    expect(slugs(sortPlayers(players, "number"))).toEqual([
      "d",
      "c",
      "a",
      "b",
    ])
  })

  it("sorts newest by induction number descending", () => {
    expect(slugs(sortPlayers(players, "newest"))).toEqual([
      "b",
      "a",
      "c",
      "d",
    ])
  })

  it("sorts by name ignoring case", () => {
    expect(slugs(sortPlayers(players, "name"))).toEqual([
      "b",
      "a",
      "c",
      "d",
    ])
  })

  it("sorts by country, ties chronological", () => {
    expect(slugs(sortPlayers(players, "country"))).toEqual([
      "a",
      "b",
      "c",
      "d",
    ])
  })

  it("never mutates the input", () => {
    const before = slugs(players)

    for (const sort of PLAYER_SORTS)
      sortPlayers(players, sort)

    expect(slugs(players)).toEqual(before)
  })

  it("has a label for every sort", () => {
    for (const sort of PLAYER_SORTS) {
      expect(PLAYER_SORT_LABELS[sort]).toBeTruthy()
    }
  })
})

describe("default player sort", () => {
  it("is chronological and listed first", () => {
    expect(DEFAULT_PLAYER_SORT).toBe("chronological")
    expect(PLAYER_SORTS[0]).toBe(DEFAULT_PLAYER_SORT)
  })
})
