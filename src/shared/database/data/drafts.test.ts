import { SQL } from "drizzle-orm"
import { pgTable, boolean } from "drizzle-orm/pg-core"
import { describe, expect, it } from "vitest"

import { isVisible } from "./drafts"

const table = pgTable("things", {
  isDraft: boolean("is_draft"),
})

describe("isVisible", () => {
  it("adds no condition when drafts may be seen", () => {
    expect(isVisible(table, true)).toBeUndefined()
  })

  it("returns an SQL condition hiding drafts otherwise", () => {
    expect(isVisible(table, false)).toBeInstanceOf(SQL)
  })
})
