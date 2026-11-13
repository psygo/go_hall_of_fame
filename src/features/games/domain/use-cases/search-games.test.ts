import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { Game } from "../entities/game"
import type { GamesRepository } from "../repositories/games-repository"
import { SearchGames } from "./search-games"

function buildGame(slug: string, name: string): Game {
  return {
    slug,
    year: 1900,
    name,
    black: "B",
    white: "W",
    blackPlayerSlug: null,
    whitePlayerSlug: null,
    result: "B+R",
    setting: "S",
    hook: "H",
    moment: "M",
    legacy: "L",
    sgfUrl: null,
    hasUploadedSgf: false,
    featured: false,
    sequence: 0,
  }
}

function buildRepository(
  listAll: GamesRepository["listAll"],
): GamesRepository {
  return {
    listAll,
    findDetailBySlug: vi.fn(),
    findSgfTextBySlug: vi.fn(),
    listPlayerOptions: vi.fn(),
    save: vi.fn(),
    deleteBySlug: vi.fn(),
  }
}

describe("SearchGames", () => {
  const all = Array.from({ length: 8 }, (_, index) =>
    buildGame(`g${index}`, `Game ${index}`),
  )

  it("searches, sorts and paginates the games", async () => {
    const repository = buildRepository(
      vi.fn(async () => succeed(all)),
    )

    const result = await new SearchGames(repository).call({
      query: "game",
      sort: "newest",
      page: 2,
    })

    expect(result).toEqual(
      succeed({
        items: [all[1], all[0]],
        page: 2,
        pageCount: 2,
        total: 8,
      }),
    )
  })

  it("returns an empty first page when nothing matches", async () => {
    const repository = buildRepository(
      vi.fn(async () => succeed(all)),
    )

    expect(
      await new SearchGames(repository).call({
        query: "zzz",
        sort: "oldest",
        page: 5,
      }),
    ).toEqual(
      succeed({
        items: [],
        page: 1,
        pageCount: 1,
        total: 0,
      }),
    )
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))
    const repository = buildRepository(
      vi.fn(async () => failure),
    )

    expect(
      await new SearchGames(repository).call({
        query: "",
        sort: "oldest",
        page: 1,
      }),
    ).toBe(failure)
  })
})
