import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { Country, Player } from "../entities/player"
import type { PlayersRepository } from "../repositories/players-repository"
import { SearchPlayers } from "./search-players"

function buildPlayer(
  number: number,
  country: Country,
): Player {
  return {
    slug: `p${number}`,
    inductionNumber: number,
    name: `Player ${number}`,
    nativeName: "",
    country,
    years: "1900-1950",
    distinction: "Master",
    bio: "Bio",
    photoUrl: null,
    photoPosition: "50% 50%",
    tags: [],
    isDraft: false,
  }
}

function buildRepository(
  listAll: PlayersRepository["listAll"],
): PlayersRepository {
  return {
    listAll,
    findDetailBySlug: vi.fn(),
    save: vi.fn(),
    deleteBySlug: vi.fn(),
  }
}

describe("SearchPlayers", () => {
  const all = Array.from({ length: 30 }, (_, index) =>
    buildPlayer(
      index + 1,
      index % 2 === 0 ? "Japan" : "China",
    ),
  )

  it("filters by country, then sorts and paginates", async () => {
    const repository = buildRepository(
      vi.fn(async () => succeed(all)),
    )

    const result = await new SearchPlayers(repository).call(
      {
        country: "Japan",
        query: "",
        sort: "newest",
        page: 2,
      },
    )

    expect(result).toEqual(
      succeed({
        items: all
          .filter((p) => p.country === "Japan")
          .reverse()
          .slice(12),
        page: 2,
        pageCount: 2,
        total: 15,
      }),
    )
  })

  it("combines the country filter with the text search", async () => {
    const repository = buildRepository(
      vi.fn(async () => succeed(all)),
    )

    const result = await new SearchPlayers(repository).call(
      {
        country: "China",
        query: "player 2",
        sort: "number",
        page: 1,
      },
    )

    expect(
      result.status === "success"
        ? result.data.items.map((p) => p.slug)
        : null,
    ).toEqual([
      "p2",
      "p12",
      "p20",
      "p22",
      "p24",
      "p26",
      "p28",
    ])
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))
    const repository = buildRepository(
      vi.fn(async () => failure),
    )

    expect(
      await new SearchPlayers(repository).call({
        country: null,
        query: "",
        sort: "number",
        page: 1,
      }),
    ).toBe(failure)
  })
})
