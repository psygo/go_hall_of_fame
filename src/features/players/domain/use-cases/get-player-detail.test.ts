import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { PlayersRepository } from "../repositories/players-repository"
import { GetPlayerDetail } from "./get-player-detail"

function buildRepository(
  findDetailBySlug: PlayersRepository["findDetailBySlug"],
): PlayersRepository {
  return {
    findDetailBySlug,
  } as unknown as PlayersRepository
}

describe("GetPlayerDetail", () => {
  it("returns the result of the repository", async () => {
    const data = null
    const findDetailBySlug = vi.fn(async () =>
      succeed(data),
    )
    const repo = buildRepository(findDetailBySlug)

    const result = await new GetPlayerDetail(repo).call({
      slug: "shusaku",
    })

    expect(repo.findDetailBySlug).toHaveBeenCalledWith(
      "shusaku",
    )
    expect(result).toEqual(succeed(data))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new GetPlayerDetail(
      buildRepository(vi.fn(async () => failure)),
    ).call({ slug: "shusaku" })

    expect(result).toBe(failure)
  })
})
