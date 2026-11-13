import { describe, expect, it } from "vitest"

import {
  CLUSTER_WITHIN_YEARS,
  layoutTimeline,
  placeTimeline,
  TIMELINE_CHUNK_SIZE,
} from "./timeline-layout"

const eventIn = (year: number) => ({
  id: year,
  year,
  title: `T${year}`,
  text: "x",
})

const layoutOf = (years: readonly number[]) =>
  layoutTimeline(years.map(eventIn))

describe("layoutTimeline", () => {
  it("returns nothing for no events", () => {
    expect(layoutTimeline([])).toEqual([])
  })

  it("starts on the left and never clusters the first event", () => {
    expect(layoutOf([1612])).toEqual([
      {
        event: eventIn(1612),
        side: "left",
        isClustered: false,
        index: 0,
      },
    ])
  })

  it("alternates sides for events that are far apart", () => {
    const sides = layoutOf([1612, 1846, 1924, 1933]).map(
      (placement) => placement.side,
    )
    expect(sides).toEqual([
      "left",
      "right",
      "left",
      "right",
    ])
  })

  it("keeps a close event on the previous side and marks it clustered", () => {
    const placements = layoutOf([1984, 2016, 2019])
    expect(placements.map((p) => p.side)).toEqual([
      "left",
      "right",
      "right",
    ])
    expect(placements.map((p) => p.isClustered)).toEqual([
      false,
      false,
      true,
    ])
  })

  it("clusters at exactly the limit but not one year beyond", () => {
    const atLimit = layoutOf([
      2000,
      2000 + CLUSTER_WITHIN_YEARS,
    ])
    const beyond = layoutOf([
      2000,
      2000 + CLUSTER_WITHIN_YEARS + 1,
    ])
    expect(atLimit[1].isClustered).toBe(true)
    expect(beyond[1].isClustered).toBe(false)
  })

  it("resumes alternating after a cluster", () => {
    const sides = layoutOf([1900, 1902, 1950]).map(
      (p) => p.side,
    )
    expect(sides).toEqual(["left", "left", "right"])
  })
})

describe("layoutTimeline indexes", () => {
  it("numbers the placements from 0 in order", () => {
    expect(
      layoutOf([1612, 1846, 1924]).map((p) => p.index),
    ).toEqual([0, 1, 2])
  })

  it("clusters by distance whichever way the years run", () => {
    const placements = layoutOf([2019, 2016, 1984])
    expect(placements.map((p) => p.isClustered)).toEqual([
      false,
      true,
      false,
    ])
    expect(placements.map((p) => p.side)).toEqual([
      "left",
      "left",
      "right",
    ])
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
    ).toEqual(years)
  })

  it("lays the reversed list out for newest, starting on the left", () => {
    const placements = placeTimeline(events, "newest")

    expect(placements.map((p) => p.event.year)).toEqual(
      [...years].reverse(),
    )
    expect(placements[0].side).toBe("left")
    expect(placements.map((p) => p.index)).toEqual([
      0, 1, 2, 3, 4, 5,
    ])
  })

  it("does not mutate the input", () => {
    placeTimeline(events, "newest")
    expect(events.map((e) => e.year)).toEqual(years)
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
