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
  photoPosition: "center",
}

const profile: PlayerProfile = {
  detail: { ...player, games: [] },
  previous: player,
  next: player,
}

function buildLoaders({
  listPlayers = vi.fn(async () => succeed([player])),
  getPlayerProfile = vi.fn(async () => succeed(profile)),
}: {
  listPlayers?: ReturnType<typeof vi.fn>
  getPlayerProfile?: ReturnType<typeof vi.fn>
} = {}) {
  return {
    loaders: createPlayersLoaders({
      listPlayers: { call: listPlayers },
      getPlayerProfile: { call: getPlayerProfile },
    }),
    listPlayers,
    getPlayerProfile,
  }
}

beforeEach(() => {
  vi.mocked(notFound).mockClear()
})

describe("loadPlayersPage", () => {
  it.each(["Japan", "China", "Korea"])(
    "filters by the valid country %s",
    async (country) => {
      const { loaders, listPlayers } = buildLoaders()

      const page = await loaders.loadPlayersPage(country)

      expect(listPlayers).toHaveBeenCalledWith({ country })
      expect(page.country).toBe(country)
    },
  )

  it.each([
    ["an unknown country", "France"],
    ["an empty string", ""],
    ["undefined", undefined],
    ["an array of countries", ["Japan", "China"]],
    ["an array with one country", ["Japan"]],
  ])("lists every country for %s", async (_name, param) => {
    const { loaders, listPlayers } = buildLoaders()

    const page = await loaders.loadPlayersPage(param)

    expect(listPlayers).toHaveBeenCalledWith({
      country: null,
    })
    expect(page.country).toBeNull()
  })

  it("returns the players and the list of countries", async () => {
    const { loaders } = buildLoaders()

    expect(
      await loaders.loadPlayersPage(undefined),
    ).toEqual({
      players: [player],
      country: null,
      countries: ["Japan", "China", "Korea"],
    })
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { loaders } = buildLoaders({
      listPlayers: vi.fn(async () => fail(cause)),
    })

    await expect(
      loaders.loadPlayersPage("Japan"),
    ).rejects.toBe(cause)
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
