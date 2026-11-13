import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { NominationsRepository } from "../repositories/nominations-repository"
import { DeleteNomination } from "./delete-nomination"

function buildRepository(
  remove: NominationsRepository["delete"],
): NominationsRepository {
  return {
    delete: remove,
  } as unknown as NominationsRepository
}

describe("DeleteNomination", () => {
  it("returns the result of the repository", async () => {
    const data = undefined
    const remove = vi.fn(async () => succeed(data))
    const repo = buildRepository(remove)

    const result = await new DeleteNomination(repo).call({
      id: 5,
    })

    expect(repo.delete).toHaveBeenCalledWith(5)
    expect(result).toEqual(succeed(data))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new DeleteNomination(
      buildRepository(vi.fn(async () => failure)),
    ).call({ id: 5 })

    expect(result).toBe(failure)
  })
})
