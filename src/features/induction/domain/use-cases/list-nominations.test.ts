import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { NominationRecord } from "../entities/nomination-record"
import type { NominationsRepository } from "../repositories/nominations-repository"
import { ListNominations } from "./list-nominations"

function buildRepository(
  listAll: NominationsRepository["listAll"],
): NominationsRepository {
  return { listAll } as unknown as NominationsRepository
}

describe("ListNominations", () => {
  it("returns the result of the repository", async () => {
    const data: NominationRecord[] = [
      {
        id: 1,
        name: "Shusaku",
        category: "player",
        email: "fan@example.com",
        caseForInduction: "Reasons",
        status: "pending",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      },
    ]
    const listAll = vi.fn(async () => succeed(data))
    const repo = buildRepository(listAll)

    const result = await new ListNominations(repo).call()

    expect(repo.listAll).toHaveBeenCalledTimes(1)
    expect(result).toEqual(succeed(data))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new ListNominations(
      buildRepository(vi.fn(async () => failure)),
    ).call()

    expect(result).toBe(failure)
  })
})
