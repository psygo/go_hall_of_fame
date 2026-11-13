import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { GamesRepository } from "../repositories/games-repository"
import { GetGameDetail } from "./get-game-detail"

function buildRepository(
  findDetailBySlug: GamesRepository["findDetailBySlug"],
): GamesRepository {
  return { findDetailBySlug } as unknown as GamesRepository
}

describe("GetGameDetail", () => {
  it("returns the result of the repository", async () => {
    const data = null
    const findDetailBySlug = vi.fn(async () =>
      succeed(data),
    )
    const repo = buildRepository(findDetailBySlug)

    const result = await new GetGameDetail(repo).call({
      slug: "g",
    })

    expect(repo.findDetailBySlug).toHaveBeenCalledWith("g")
    expect(result).toEqual(succeed(data))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new GetGameDetail(
      buildRepository(vi.fn(async () => failure)),
    ).call({ slug: "g" })

    expect(result).toBe(failure)
  })
})
