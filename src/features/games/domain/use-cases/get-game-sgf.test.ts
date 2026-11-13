import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { GamesRepository } from "../repositories/games-repository"
import { GetGameSgf } from "./get-game-sgf"

function buildRepository(
  findSgfTextBySlug: GamesRepository["findSgfTextBySlug"],
): GamesRepository {
  return {
    listAll: vi.fn(),
    findDetailBySlug: vi.fn(),
    findSgfTextBySlug,
    listPlayerOptions: vi.fn(),
    save: vi.fn(),
    deleteBySlug: vi.fn(),
  }
}

describe("GetGameSgf", () => {
  it("returns the stored text for the slug", async () => {
    const find = vi.fn(async () => succeed("(;GM[1])"))

    const result = await new GetGameSgf(
      buildRepository(find),
    ).call({ slug: "ear-reddening-game" })

    expect(find).toHaveBeenCalledWith("ear-reddening-game")
    expect(result).toEqual(succeed("(;GM[1])"))
  })

  it("returns null when the game has no uploaded SGF", async () => {
    const result = await new GetGameSgf(
      buildRepository(async () => succeed(null)),
    ).call({ slug: "x" })

    expect(result).toEqual(succeed(null))
  })

  it("passes a failure through", async () => {
    const error = new Error("db down")

    const result = await new GetGameSgf(
      buildRepository(async () => fail(error)),
    ).call({ slug: "x" })

    expect(result).toEqual(fail(error))
  })
})
