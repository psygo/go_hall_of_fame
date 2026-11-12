import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
}))
vi.mock("next/server", () => ({
  connection: vi.fn(async () => undefined),
}))
vi.mock("react", () => ({
  cache: <T>(fn: T) => fn,
}))

import { notFound } from "next/navigation"

import { fail, succeed } from "@/core/data-state"

import type {
  Game,
  GameProfile,
} from "../../domain/entities/game"
import { createGamesLoaders } from "./games-loaders"

const game: Game = {
  slug: "ear-reddening",
  year: 1846,
  name: "Ear-Reddening",
  black: "B",
  white: "W",
  result: "B+2",
  setting: "S",
  hook: "H",
  moment: "M",
  legacy: "L",
  sgfUrl: null,
}

const profile: GameProfile = {
  detail: { ...game, players: [] },
  previous: game,
  next: game,
}

function buildLoaders({
  listGames = vi.fn(async () => succeed([game])),
  getGameProfile = vi.fn(async () => succeed(profile)),
}: {
  listGames?: ReturnType<typeof vi.fn>
  getGameProfile?: ReturnType<typeof vi.fn>
} = {}) {
  return createGamesLoaders({
    listGames: { call: listGames },
    getGameProfile: { call: getGameProfile },
  })
}

beforeEach(() => {
  vi.mocked(notFound).mockClear()
})

describe("loadGames", () => {
  it("returns the games", async () => {
    expect(await buildLoaders().loadGames()).toEqual([game])
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const loaders = buildLoaders({
      listGames: vi.fn(async () => fail(cause)),
    })

    await expect(loaders.loadGames()).rejects.toBe(cause)
  })
})

describe("loadGameProfile", () => {
  it("returns the profile of the slug", async () => {
    const getGameProfile = vi.fn(async () =>
      succeed(profile),
    )
    const loaders = buildLoaders({ getGameProfile })

    const result =
      await loaders.loadGameProfile("ear-reddening")

    expect(getGameProfile).toHaveBeenCalledWith({
      slug: "ear-reddening",
    })
    expect(result).toBe(profile)
  })

  it("calls notFound when the use case returns null", async () => {
    const loaders = buildLoaders({
      getGameProfile: vi.fn(async () => succeed(null)),
    })

    await expect(
      loaders.loadGameProfile("nope"),
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(notFound).toHaveBeenCalledTimes(1)
  })

  it("throws the original error and does not call notFound when the use case fails", async () => {
    const cause = new Error("db down")
    const loaders = buildLoaders({
      getGameProfile: vi.fn(async () => fail(cause)),
    })

    await expect(loaders.loadGameProfile("x")).rejects.toBe(
      cause,
    )
    expect(notFound).not.toHaveBeenCalled()
  })
})
