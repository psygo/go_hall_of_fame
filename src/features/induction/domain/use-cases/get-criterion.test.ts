import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { CriteriaRepository } from "../repositories/criteria-repository"
import { GetCriterion } from "./get-criterion"

function buildRepository(
  findById: CriteriaRepository["findById"],
): CriteriaRepository {
  return { findById } as unknown as CriteriaRepository
}

describe("GetCriterion", () => {
  it("returns the result of the repository", async () => {
    const data = {
      id: 4,
      position: 1,
      title: "T",
      text: "x",
    }
    const findById = vi.fn(async () => succeed(data))
    const repo = buildRepository(findById)

    const result = await new GetCriterion(repo).call({
      id: 4,
    })

    expect(repo.findById).toHaveBeenCalledWith(4)
    expect(result).toEqual(succeed(data))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new GetCriterion(
      buildRepository(vi.fn(async () => failure)),
    ).call({ id: 4 })

    expect(result).toBe(failure)
  })
})
