import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type {
  Player,
  PlayerDetail,
} from "../entities/player"
import type { PlayersRepository } from "../repositories/players-repository"
import { GetPlayerProfile } from "./get-player-profile"

const unusedMethods = {
  save: vi.fn(),
  deleteBySlug: vi.fn(),
}

function buildPlayer(slug: string): Player {
  return {
    slug,
    inductionNumber: 1,
    name: slug,
    nativeName: slug,
    country: "Japan",
    years: "1900-1950",
    distinction: "Master",
    bio: "Bio",
    photoUrl: null,
    photoPosition: "center",
    featured: false,
  }
}

function buildDetail(slug: string): PlayerDetail {
  return { ...buildPlayer(slug), games: [] }
}

describe("GetPlayerProfile", () => {
  const all = [
    buildPlayer("a"),
    buildPlayer("b"),
    buildPlayer("c"),
  ]

  it("returns the detail with its neighbors", async () => {
    const detail = buildDetail("b")
    const repository: PlayersRepository = {
      ...unusedMethods,
      listAll: vi.fn(async () => succeed(all)),
      findDetailBySlug: vi.fn(async () => succeed(detail)),
    }

    const result = await new GetPlayerProfile(
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
    const repository: PlayersRepository = {
      ...unusedMethods,
      listAll: vi.fn(async () => succeed(all)),
      findDetailBySlug: vi.fn(async () =>
        succeed(buildDetail("a")),
      ),
    }

    const result = await new GetPlayerProfile(
      repository,
    ).call({
      slug: "a",
    })

    expect(result).toMatchObject({
      status: "success",
      data: { previous: all[2], next: all[1] },
    })
  })

  it("returns a null profile when the player does not exist, without listing", async () => {
    const repository: PlayersRepository = {
      ...unusedMethods,
      listAll: vi.fn(async () => succeed(all)),
      findDetailBySlug: vi.fn(async () => succeed(null)),
    }

    const result = await new GetPlayerProfile(
      repository,
    ).call({
      slug: "nobody",
    })

    expect(result).toEqual(succeed(null))
    expect(repository.listAll).not.toHaveBeenCalled()
  })

  it("propagates a failure of the detail lookup", async () => {
    const failure = fail(new Error("detail failed"))
    const repository: PlayersRepository = {
      ...unusedMethods,
      listAll: vi.fn(async () => succeed(all)),
      findDetailBySlug: vi.fn(async () => failure),
    }

    const result = await new GetPlayerProfile(
      repository,
    ).call({
      slug: "b",
    })

    expect(result).toBe(failure)
  })

  it("propagates a failure of the list lookup", async () => {
    const failure = fail(new Error("list failed"))
    const repository: PlayersRepository = {
      ...unusedMethods,
      listAll: vi.fn(async () => failure),
      findDetailBySlug: vi.fn(async () =>
        succeed(buildDetail("b")),
      ),
    }

    const result = await new GetPlayerProfile(
      repository,
    ).call({
      slug: "b",
    })

    expect(result).toBe(failure)
  })

  it("fails when the player is missing from the list", async () => {
    const repository: PlayersRepository = {
      ...unusedMethods,
      listAll: vi.fn(async () => succeed(all)),
      findDetailBySlug: vi.fn(async () =>
        succeed(buildDetail("ghost")),
      ),
    }

    const result = await new GetPlayerProfile(
      repository,
    ).call({
      slug: "ghost",
    })

    expect(result.status).toBe("failure")
    if (result.status === "failure") {
      expect(result.error.message).toBe(
        "Player ghost is missing from the list",
      )
    }
  })
})
