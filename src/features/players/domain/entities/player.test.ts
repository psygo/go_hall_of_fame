import { describe, expect, it } from "vitest"

import {
  filterPlayersByCountry,
  findNeighborsOfPlayer,
  isCountry,
  type Country,
  type Player,
} from "./player"

function buildPlayer(
  slug: string,
  country: Country = "Japan",
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
  }
}

describe("isCountry", () => {
  it.each(["Japan", "China", "Korea"])(
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
