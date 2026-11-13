import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { PlayersRepository } from "../repositories/players-repository"
import { DeletePlayer } from "./delete-player"

function buildRepository(
  deleteBySlug: PlayersRepository["deleteBySlug"],
): PlayersRepository {
  return { deleteBySlug } as unknown as PlayersRepository
}

describe("DeletePlayer", () => {
  it("returns the result of the repository", async () => {
    const data = undefined
    const deleteBySlug = vi.fn(async () => succeed(data))
    const repo = buildRepository(deleteBySlug)

    const result = await new DeletePlayer(repo).call({
      slug: "shusaku",
    })

    expect(repo.deleteBySlug).toHaveBeenCalledWith(
      "shusaku",
    )
    expect(result).toEqual(succeed(data))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new DeletePlayer(
      buildRepository(vi.fn(async () => failure)),
    ).call({ slug: "shusaku" })

    expect(result).toBe(failure)
  })
})
