import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import {
  CRITERIA_PAGE_SIZE,
  type Criterion,
} from "../entities/criterion"
import type { CriteriaRepository } from "../repositories/criteria-repository"
import { PageCriteria } from "./page-criteria"

function buildRepository(
  listAll: CriteriaRepository["listAll"],
): CriteriaRepository {
  return {
    listAll,
    findById: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  }
}

const criteria: Criterion[] = Array.from(
  { length: CRITERIA_PAGE_SIZE + 1 },
  (_, index) => ({
    id: index + 1,
    position: index + 1,
    title: `T${index + 1}`,
    text: "x",
  }),
)

describe("PageCriteria", () => {
  it("orders then paginates", async () => {
    const result = await new PageCriteria(
      buildRepository(vi.fn(async () => succeed(criteria))),
    ).call({ order: "last", page: 2 })

    expect(result).toEqual(
      succeed({
        items: [criteria[0]],
        page: 2,
        pageCount: 2,
        total: criteria.length,
      }),
    )
  })

  it("clamps a page past the end", async () => {
    const result = await new PageCriteria(
      buildRepository(vi.fn(async () => succeed(criteria))),
    ).call({ order: "first", page: 50 })

    expect(
      result.status === "success" && result.data.page,
    ).toBe(2)
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    expect(
      await new PageCriteria(
        buildRepository(vi.fn(async () => failure)),
      ).call({ order: "first", page: 1 }),
    ).toBe(failure)
  })
})
