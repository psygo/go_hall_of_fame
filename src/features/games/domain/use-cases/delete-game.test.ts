import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { GamesRepository } from "../repositories/games-repository"
import { DeleteGame } from "./delete-game"

function buildRepository(
  deleteBySlug: GamesRepository["deleteBySlug"],
): GamesRepository {
  return { deleteBySlug } as unknown as GamesRepository
}

describe("DeleteGame", () => {
  it("returns the result of the repository", async () => {
    const data = undefined
    const deleteBySlug = vi.fn(async () => succeed(data))
    const repo = buildRepository(deleteBySlug)

    const result = await new DeleteGame(repo).call({
      slug: "g",
    })

    expect(repo.deleteBySlug).toHaveBeenCalledWith("g")
    expect(result).toEqual(succeed(data))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new DeleteGame(
      buildRepository(vi.fn(async () => failure)),
    ).call({ slug: "g" })

    expect(result).toBe(failure)
  })
})
