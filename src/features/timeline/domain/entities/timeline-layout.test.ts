import { describe, expect, it } from "vitest"

import {
  layoutTimeline,
  placeTimeline,
  TIMELINE_CHUNK_SIZE,
} from "./timeline-layout"

const eventIn = (year: number) => ({
  id: year,
  year: String(year),
  title: `T${year}`,
  text: "x",
  games: [],
  players: [],
  isDraft: false,
})

const layoutOf = (years: readonly number[]) =>
  layoutTimeline(years.map(eventIn))

describe("layoutTimeline", () => {
  it("returns nothing for no events", () => {
    expect(layoutTimeline([])).toEqual([])
  })

  it("starts on the left", () => {
    expect(layoutOf([1612])).toEqual([
      { event: eventIn(1612), side: "left", index: 0 },
    ])
  })

  it("alternates sides whatever the years are", () => {
    expect(
      layoutOf([2000, 2001, 2001, 1500, 1]).map(
        (p) => p.side,
      ),
    ).toEqual(["left", "right", "left", "right", "left"])
  })

  it("numbers the placements from 0 in order", () => {
    expect(
      layoutOf([1612, 1846, 1924]).map((p) => p.index),
    ).toEqual([0, 1, 2])
  })
})

describe("placeTimeline", () => {
  const years = [1612, 1846, 1849, 1924, 1933, 2016]
  const events = years.map(eventIn)

  it("keeps the chronological order for oldest", () => {
    expect(
      placeTimeline(events, "oldest").map(
        (p) => p.event.year,
      ),
    ).toEqual(years.map(String))
  })

  it("lays the reversed list out for newest, starting on the left", () => {
    const placements = placeTimeline(events, "newest")

    expect(placements.map((p) => p.event.year)).toEqual(
      [...years].reverse().map(String),
    )
    expect(placements[0].side).toBe("left")
    expect(placements.map((p) => p.index)).toEqual([
      0, 1, 2, 3, 4, 5,
    ])
  })

  it("does not mutate the input", () => {
    placeTimeline(events, "newest")
    expect(events.map((e) => e.year)).toEqual(
      years.map(String),
    )
  })

  it("gives the same sides whatever chunk is read from it", () => {
    const many = Array.from(
      { length: TIMELINE_CHUNK_SIZE * 2 + 1 },
      (_, i) => eventIn(1000 + i * 20),
    )
    const whole = placeTimeline(many, "oldest")

    expect(whole.map((p) => p.side).slice(0, 4)).toEqual([
      "left",
      "right",
      "left",
      "right",
    ])
    expect(whole[TIMELINE_CHUNK_SIZE].index).toBe(
      TIMELINE_CHUNK_SIZE,
    )
  })
})
