import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { Game, GameDetail } from "../entities/game"
import type { GamesRepository } from "../repositories/games-repository"
import { GetGameProfile } from "./get-game-profile"

const unusedMethods = {
  listPlayerOptions: vi.fn(),
  save: vi.fn(),
  deleteBySlug: vi.fn(),
  findSgfTextBySlug: vi.fn(),
}

function buildGame(slug: string): Game {
  return {
    slug,
    year: 1900,
    name: slug,
    black: "B",
    white: "W",
    result: "B+R",
    setting: "S",
    description: "H",
    blackPlayerSlug: null,
    whitePlayerSlug: null,
    sgfUrl: null,
    hasUploadedSgf: false,
    highlightMove: null,
    tags: [],
    sequence: 0,
  }
}

function buildDetail(slug: string): GameDetail {
  return { ...buildGame(slug), players: [], resources: [] }
}

describe("GetGameProfile", () => {
  const all = [
    buildGame("a"),
    buildGame("b"),
    buildGame("c"),
  ]

  it("returns the detail with its neighbors", async () => {
    const detail = buildDetail("b")
    const repository: GamesRepository = {
      ...unusedMethods,
      listAll: vi.fn(async () => succeed(all)),
      findDetailBySlug: vi.fn(async () => succeed(detail)),
    }

    const result = await new GetGameProfile(
      repository,
    ).call({
      slug: "b",
    })

    expect(
      repository.findDetailBySlug,
    ).toHaveBeenCalledWith("b")
    expect(result).toEqual(
      succeed({ detail, previous: all[0], next: all[2] }),
    )
  })

  it("wraps neighbors around the ends of the list", async () => {
    const repository: GamesRepository = {
      ...unusedMethods,
      listAll: vi.fn(async () => succeed(all)),
      findDetailBySlug: vi.fn(async () =>
        succeed(buildDetail("c")),
      ),
    }

    const result = await new GetGameProfile(
      repository,
    ).call({
      slug: "c",
    })

    expect(result).toMatchObject({
      status: "success",
      data: { previous: all[1], next: all[0] },
    })
  })

  it("returns a null profile when the game does not exist, without listing", async () => {
    const repository: GamesRepository = {
      ...unusedMethods,
      listAll: vi.fn(async () => succeed(all)),
      findDetailBySlug: vi.fn(async () => succeed(null)),
    }

    const result = await new GetGameProfile(
      repository,
    ).call({
      slug: "nope",
    })

    expect(result).toEqual(succeed(null))
    expect(repository.listAll).not.toHaveBeenCalled()
  })

  it("propagates a failure of the detail lookup", async () => {
    const failure = fail(new Error("detail failed"))
    const repository: GamesRepository = {
      ...unusedMethods,
      listAll: vi.fn(async () => succeed(all)),
      findDetailBySlug: vi.fn(async () => failure),
    }

    expect(
      await new GetGameProfile(repository).call({
        slug: "b",
      }),
    ).toBe(failure)
  })

  it("propagates a failure of the list lookup", async () => {
    const failure = fail(new Error("list failed"))
    const repository: GamesRepository = {
      ...unusedMethods,
      listAll: vi.fn(async () => failure),
      findDetailBySlug: vi.fn(async () =>
        succeed(buildDetail("b")),
      ),
    }

    expect(
      await new GetGameProfile(repository).call({
        slug: "b",
      }),
    ).toBe(failure)
  })

  it("fails when the game is missing from the list", async () => {
    const repository: GamesRepository = {
      ...unusedMethods,
      listAll: vi.fn(async () => succeed(all)),
      findDetailBySlug: vi.fn(async () =>
        succeed(buildDetail("ghost")),
      ),
    }

    const result = await new GetGameProfile(
      repository,
    ).call({
      slug: "ghost",
    })

    expect(result.status).toBe("failure")
    if (result.status === "failure") {
      expect(result.error.message).toBe(
        "Game ghost is missing from the list",
      )
    }
  })
})
