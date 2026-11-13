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
  description: "H",
  blackPlayerSlug: null,
  whitePlayerSlug: null,
  sgfUrl: null,
  hasUploadedSgf: false,
  highlightMove: null,
  featured: false,
  tags: [],
  sequence: 0,
}

const profile: GameProfile = {
  detail: { ...game, players: [], resources: [] },
  previous: game,
  next: game,
}

const emptyPage = {
  items: [game],
  page: 1,
  pageCount: 1,
  total: 1,
}

function buildLoaders({
  searchGames = vi.fn(async () => succeed(emptyPage)),
  getGameSgf = vi.fn(async () => succeed(null)),
  getGameProfile = vi.fn(async () => succeed(profile)),
}: {
  searchGames?: ReturnType<typeof vi.fn>
  getGameSgf?: ReturnType<typeof vi.fn>
  getGameProfile?: ReturnType<typeof vi.fn>
} = {}) {
  return createGamesLoaders({
    searchGames: { call: searchGames },
    getGameSgf: { call: getGameSgf },
    getGameProfile: { call: getGameProfile },
  })
}

beforeEach(() => {
  vi.mocked(notFound).mockClear()
})

describe("loadGamesPage", () => {
  it("returns the page with the parsed query and sort", async () => {
    const searchGames = vi.fn(async () =>
      succeed(emptyPage),
    )

    const state = await buildLoaders({
      searchGames,
    }).loadGamesPage({
      q: "  shusaku ",
      sort: "newest",
      page: "3",
    })

    expect(searchGames).toHaveBeenCalledWith({
      query: "shusaku",
      sort: "newest",
      page: 3,
    })
    expect(state).toEqual({
      games: emptyPage,
      query: "shusaku",
      sort: "newest",
    })
  })

  it("falls back to defaults for garbage parameters", async () => {
    const searchGames = vi.fn(async () =>
      succeed(emptyPage),
    )

    await buildLoaders({ searchGames }).loadGamesPage({
      sort: "drop table",
      page: "-4",
    })

    expect(searchGames).toHaveBeenCalledWith({
      query: "",
      sort: "newest",
      page: 1,
    })
  })

  it("defaults to the newest games first", async () => {
    const searchGames = vi.fn(async () =>
      succeed(emptyPage),
    )

    const state = await buildLoaders({
      searchGames,
    }).loadGamesPage({})

    expect(state.sort).toBe("newest")
    expect(searchGames).toHaveBeenCalledWith(
      expect.objectContaining({ sort: "newest" }),
    )
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const loaders = buildLoaders({
      searchGames: vi.fn(async () => fail(cause)),
    })

    await expect(loaders.loadGamesPage({})).rejects.toBe(
      cause,
    )
  })
})

describe("loadGameSgf", () => {
  it("returns the text, or null when none is stored", async () => {
    const getGameSgf = vi
      .fn()
      .mockResolvedValueOnce(succeed("(;GM[1])"))
      .mockResolvedValueOnce(succeed(null))
    const loaders = buildLoaders({ getGameSgf })

    expect(await loaders.loadGameSgf("a")).toBe("(;GM[1])")
    expect(await loaders.loadGameSgf("b")).toBeNull()
    expect(getGameSgf).toHaveBeenCalledWith({ slug: "a" })
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
