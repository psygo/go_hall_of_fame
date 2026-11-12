import { describe, expect, it } from "vitest"

import {
  countCenturiesSpanned,
  summarizeHome,
  type HomeFacts,
} from "./home-summary"

describe("countCenturiesSpanned", () => {
  it("returns 0 when the first year is null", () => {
    expect(countCenturiesSpanned(null, 2000)).toBe(0)
  })

  it("returns 0 when the last year is null", () => {
    expect(countCenturiesSpanned(1600, null)).toBe(0)
  })

  it("returns 0 when both years are null", () => {
    expect(countCenturiesSpanned(null, null)).toBe(0)
  })

  it("rounds the span to the nearest century (1612..2019 -> 4)", () => {
    expect(countCenturiesSpanned(1612, 2019)).toBe(4)
  })

  it("returns an exact count when the span is a whole number of centuries", () => {
    expect(countCenturiesSpanned(1600, 2000)).toBe(4)
  })

  it("rounds half a century up", () => {
    expect(countCenturiesSpanned(1600, 1650)).toBe(1)
    expect(countCenturiesSpanned(1600, 1649)).toBe(0)
  })

  it("returns 0 when both years are the same", () => {
    expect(countCenturiesSpanned(1800, 1800)).toBe(0)
  })
})

describe("summarizeHome", () => {
  const facts: HomeFacts = {
    playerCount: 12,
    gameCount: 8,
    firstYear: 1612,
    lastYear: 2019,
    featuredGame: {
      slug: "g",
      name: "Game",
      year: 1846,
      black: "B",
      white: "W",
      hook: "Hook",
    },
    featuredPlayer: null,
  }

  it("keeps the counts and featured items and adds the centuries", () => {
    expect(summarizeHome(facts)).toEqual({
      playerCount: 12,
      gameCount: 8,
      featuredGame: facts.featuredGame,
      featuredPlayer: null,
      centuries: 4,
    })
  })

  it("drops the raw first and last year", () => {
    const summary = summarizeHome(facts)

    expect(summary).not.toHaveProperty("firstYear")
    expect(summary).not.toHaveProperty("lastYear")
  })

  it("reports zero centuries when the years are unknown", () => {
    const summary = summarizeHome({
      ...facts,
      firstYear: null,
      lastYear: null,
    })

    expect(summary.centuries).toBe(0)
  })
})
