import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { NominationsRepository } from "../repositories/nominations-repository"
import { SetNominationStatus } from "./set-nomination-status"

function buildRepository(
  updateStatus: NominationsRepository["updateStatus"],
): NominationsRepository {
  return {
    updateStatus,
  } as unknown as NominationsRepository
}

describe("SetNominationStatus", () => {
  it("returns the result of the repository", async () => {
    const data = undefined
    const updateStatus = vi.fn(async () => succeed(data))
    const repo = buildRepository(updateStatus)

    const result = await new SetNominationStatus(repo).call(
      { id: 5, status: "accepted" },
    )

    expect(repo.updateStatus).toHaveBeenCalledWith(
      5,
      "accepted",
    )
    expect(result).toEqual(succeed(data))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new SetNominationStatus(
      buildRepository(vi.fn(async () => failure)),
    ).call({ id: 5, status: "accepted" })

    expect(result).toBe(failure)
  })
})
