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
  Player,
  PlayerProfile,
} from "../../domain/entities/player"
import { createPlayersLoaders } from "./players-loaders"

const player: Player = {
  slug: "shusaku",
  inductionNumber: 1,
  name: "Shusaku",
  nativeName: "秀策",
  country: "Japan",
  years: "1829-1862",
  distinction: "Invincible",
  bio: "Bio",
  photoUrl: null,
  featured: false,
  photoPosition: "center",
}

const profile: PlayerProfile = {
  detail: { ...player, games: [], resources: [] },
  previous: player,
  next: player,
}

const emptyPage = {
  items: [player],
  page: 1,
  pageCount: 1,
  total: 1,
}

function buildLoaders({
  searchPlayers = vi.fn(async () => succeed(emptyPage)),
  getPlayerProfile = vi.fn(async () => succeed(profile)),
}: {
  searchPlayers?: ReturnType<typeof vi.fn>
  getPlayerProfile?: ReturnType<typeof vi.fn>
} = {}) {
  return {
    loaders: createPlayersLoaders({
      searchPlayers: { call: searchPlayers },
      getPlayerProfile: { call: getPlayerProfile },
    }),
    searchPlayers,
    getPlayerProfile,
  }
}

beforeEach(() => {
  vi.mocked(notFound).mockClear()
})

describe("loadPlayersPage", () => {
  it.each(["Japan", "China", "Korea", "Others"])(
    "filters by the valid country %s",
    async (country) => {
      const { loaders, searchPlayers } = buildLoaders()

      const state = await loaders.loadPlayersPage({
        country,
      })

      expect(searchPlayers).toHaveBeenCalledWith(
        expect.objectContaining({ country }),
      )
      expect(state.country).toBe(country)
    },
  )

  it.each([
    ["an unknown country", "France"],
    ["an empty string", ""],
    ["undefined", undefined],
  ])("lists every country for %s", async (_name, param) => {
    const { loaders, searchPlayers } = buildLoaders()

    const state = await loaders.loadPlayersPage({
      country: param,
    })

    expect(searchPlayers).toHaveBeenCalledWith(
      expect.objectContaining({ country: null }),
    )
    expect(state.country).toBeNull()
  })

  it("uses the first value of a repeated country parameter", async () => {
    const { loaders } = buildLoaders()

    const state = await loaders.loadPlayersPage({
      country: ["China", "Japan"],
    })

    expect(state.country).toBe("China")
  })

  it("passes the parsed query, sort and page", async () => {
    const { loaders, searchPlayers } = buildLoaders()

    const state = await loaders.loadPlayersPage({
      q: "  gu ",
      sort: "name",
      page: "2",
    })

    expect(searchPlayers).toHaveBeenCalledWith({
      country: null,
      query: "gu",
      sort: "name",
      page: 2,
    })
    expect(state).toEqual({
      players: emptyPage,
      country: null,
      countries: ["Japan", "China", "Korea", "Others"],
      query: "gu",
      sort: "name",
    })
  })

  it("falls back to defaults for garbage parameters", async () => {
    const { loaders, searchPlayers } = buildLoaders()

    await loaders.loadPlayersPage({
      sort: "nope",
      page: "0x10",
    })

    expect(searchPlayers).toHaveBeenCalledWith({
      country: null,
      query: "",
      sort: "newest",
      page: 1,
    })
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { loaders } = buildLoaders({
      searchPlayers: vi.fn(async () => fail(cause)),
    })

    await expect(loaders.loadPlayersPage({})).rejects.toBe(
      cause,
    )
  })
})

describe("loadPlayerProfile", () => {
  it("returns the profile of the slug", async () => {
    const { loaders, getPlayerProfile } = buildLoaders()

    const result =
      await loaders.loadPlayerProfile("shusaku")

    expect(getPlayerProfile).toHaveBeenCalledWith({
      slug: "shusaku",
    })
    expect(result).toBe(profile)
  })

  it("calls notFound when the use case returns null", async () => {
    const { loaders } = buildLoaders({
      getPlayerProfile: vi.fn(async () => succeed(null)),
    })

    await expect(
      loaders.loadPlayerProfile("nobody"),
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(notFound).toHaveBeenCalledTimes(1)
  })

  it("throws the original error and does not call notFound when the use case fails", async () => {
    const cause = new Error("db down")
    const { loaders } = buildLoaders({
      getPlayerProfile: vi.fn(async () => fail(cause)),
    })

    await expect(
      loaders.loadPlayerProfile("x"),
    ).rejects.toBe(cause)
    expect(notFound).not.toHaveBeenCalled()
  })
})
