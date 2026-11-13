import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { Player } from "../entities/player"
import type { PlayersRepository } from "../repositories/players-repository"
import { ListPlayers } from "./list-players"

function buildPlayer(
  slug: string,
  country: Player["country"],
): Player {
  return {
    slug,
    inductionNumber: 1,
    name: slug,
    nativeName: slug,
    country,
    years: "1900-1950",
    distinction: "Master",
    bio: "Bio",
    photoUrl: null,
    photoPosition: "center",
    tags: [],
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

describe("ListPlayers", () => {
  const players = [
    buildPlayer("a", "Japan"),
    buildPlayer("b", "China"),
  ]

  it("returns every player when no country is given", async () => {
    const useCase = new ListPlayers(
      buildRepository(vi.fn(async () => succeed(players))),
    )

    expect(await useCase.call({ country: null })).toEqual(
      succeed(players),
    )
  })

  it("returns only the players of the given country", async () => {
    const useCase = new ListPlayers(
      buildRepository(vi.fn(async () => succeed(players))),
    )

    expect(
      await useCase.call({ country: "China" }),
    ).toEqual(succeed([players[1]]))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))
    const useCase = new ListPlayers(
      buildRepository(vi.fn(async () => failure)),
    )

    expect(await useCase.call({ country: null })).toBe(
      failure,
    )
  })
})
