import { describe, expect, it } from "vitest"

import { orderCriteria, type Criterion } from "./criterion"

const criteria: Criterion[] = [1, 2, 3].map((n) => ({
  id: n,
  position: n,
  title: `T${n}`,
  text: "x",
}))

describe("orderCriteria", () => {
  it("keeps the order by position for first", () => {
    expect(orderCriteria(criteria, "first")).toEqual(
      criteria,
    )
  })

  it("reverses for last without mutating the input", () => {
    expect(
      orderCriteria(criteria, "last").map((c) => c.id),
    ).toEqual([3, 2, 1])
    expect(criteria.map((c) => c.id)).toEqual([1, 2, 3])
  })
})
