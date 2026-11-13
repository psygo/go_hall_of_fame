import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { GamesRepository } from "../repositories/games-repository"
import { ListGamePlayerOptions } from "./list-game-player-options"

function buildRepository(
  listPlayerOptions: GamesRepository["listPlayerOptions"],
): GamesRepository {
  return { listPlayerOptions } as unknown as GamesRepository
}

describe("ListGamePlayerOptions", () => {
  it("returns the result of the repository", async () => {
    const data = [{ slug: "shusaku", name: "Shusaku" }]
    const listPlayerOptions = vi.fn(async () =>
      succeed(data),
    )
    const repo = buildRepository(listPlayerOptions)

    const result = await new ListGamePlayerOptions(
      repo,
    ).call()

    expect(repo.listPlayerOptions).toHaveBeenCalledTimes(1)
    expect(result).toEqual(succeed(data))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new ListGamePlayerOptions(
      buildRepository(vi.fn(async () => failure)),
    ).call()

    expect(result).toBe(failure)
  })
})
