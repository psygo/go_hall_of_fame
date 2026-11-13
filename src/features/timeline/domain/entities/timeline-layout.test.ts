import { describe, expect, it } from "vitest"

import {
  CLUSTER_WITHIN_YEARS,
  layoutTimeline,
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
