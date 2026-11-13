import { describe, expect, it } from "vitest"

import {
  filterPlayersByCountry,
  findNeighborsOfPlayer,
  isCountry,
  searchPlayers,
  sortPlayers,
  type Country,
  type Player,
  DEFAULT_PLAYER_SORT,
  PLAYER_SORTS,
} from "./player"

function buildPlayer(
  slug: string,
  country: Country = "Japan",
  overrides: Partial<Player> = {},
): Player {
  return {
    slug,
    inductionNumber: 1,
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

describe("sortPlayers", () => {
  const players = [
    buildPlayer("a", "Korea", {
      name: "Zed",
      inductionNumber: 1,
    }),
    buildPlayer("b", "China", {
      name: "alice",
      inductionNumber: 2,
    }),
    buildPlayer("c", "China", {
      name: "Bob",
      inductionNumber: 3,
    }),
  ]
  const slugs = (list: readonly Player[]) =>
    list.map((player) => player.slug)

  it("keeps the induction order for number", () => {
    expect(slugs(sortPlayers(players, "number"))).toEqual([
      "a",
      "b",
      "c",
    ])
  })

  it("reverses for newest without mutating the input", () => {
    expect(slugs(sortPlayers(players, "newest"))).toEqual([
      "c",
      "b",
      "a",
    ])
    expect(slugs(players)).toEqual(["a", "b", "c"])
  })

  it("sorts by name ignoring case", () => {
    expect(slugs(sortPlayers(players, "name"))).toEqual([
      "b",
      "c",
      "a",
    ])
  })

  it("sorts by country, then induction number", () => {
    expect(slugs(sortPlayers(players, "country"))).toEqual([
      "b",
      "c",
      "a",
    ])
  })
})

describe("default player sort", () => {
  it("is newest and listed first", () => {
    expect(DEFAULT_PLAYER_SORT).toBe("newest")
    expect(PLAYER_SORTS[0]).toBe(DEFAULT_PLAYER_SORT)
  })
})
