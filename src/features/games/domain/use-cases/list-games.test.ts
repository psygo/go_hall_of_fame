import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { Game } from "../entities/game"
import type { GamesRepository } from "../repositories/games-repository"
import { ListGames } from "./list-games"

const game: Game = {
  slug: "a",
  year: 1900,
  name: "A",
  black: "B",
  white: "W",
  result: "B+R",
  setting: "S",
  hook: "H",
  moment: "M",
  legacy: "L",
  sgfUrl: null,
}

describe("ListGames", () => {
  it("returns the games of the repository", async () => {
    const repository: GamesRepository = {
      listAll: vi.fn(async () => succeed([game])),
      findDetailBySlug: vi.fn(),
    }

    expect(await new ListGames(repository).call()).toEqual(
      succeed([game]),
    )
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))
    const repository: GamesRepository = {
      listAll: vi.fn(async () => failure),
      findDetailBySlug: vi.fn(),
    }

    expect(await new ListGames(repository).call()).toBe(
      failure,
    )
  })
})
