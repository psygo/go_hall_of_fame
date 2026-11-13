import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { CriteriaRepository } from "../repositories/criteria-repository"
import { DeleteCriterion } from "./delete-criterion"

function buildRepository(
  remove: CriteriaRepository["delete"],
): CriteriaRepository {
  return { delete: remove } as unknown as CriteriaRepository
}

describe("DeleteCriterion", () => {
  it("returns the result of the repository", async () => {
    const data = undefined
    const remove = vi.fn(async () => succeed(data))
    const repo = buildRepository(remove)

    const result = await new DeleteCriterion(repo).call({
      id: 4,
    })

    expect(repo.delete).toHaveBeenCalledWith(4)
    expect(result).toEqual(succeed(data))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new DeleteCriterion(
      buildRepository(vi.fn(async () => failure)),
    ).call({ id: 4 })

    expect(result).toBe(failure)
  })
})
