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

import type { Contributor } from "../../domain/entities/contributor"
import { createContributorsLoaders } from "./contributors-loaders"

const contributor: Contributor = {
  slug: "kgs",
  name: "KGS",
  kind: "organization",
  role: "Server",
  birthYear: 1900,
  period: "",
  bio: "Bio",
  photoUrl: null,
  photoPosition: "50% 50%",
  isDraft: false,
}

function buildLoaders({
  list = vi.fn(async () => succeed([contributor])),
  get = vi.fn(async () =>
    succeed<Contributor | null>(contributor),
  ),
}: {
  list?: ReturnType<typeof vi.fn>
  get?: ReturnType<typeof vi.fn>
} = {}) {
  return {
    loaders: createContributorsLoaders({
      listContributors: { call: list },
      getContributor: { call: get },
    }),
    list,
    get,
  }
}

beforeEach(() => {
  vi.mocked(notFound).mockClear()
})

describe("loadContributors", () => {
  it("returns the contributors", async () => {
    const { loaders } = buildLoaders()

    expect(await loaders.loadContributors()).toEqual([
      contributor,
    ])
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { loaders } = buildLoaders({
      list: vi.fn(async () => fail(cause)),
    })

    await expect(loaders.loadContributors()).rejects.toBe(
      cause,
    )
  })
})

describe("loadContributor", () => {
  it("returns the contributor of the slug", async () => {
    const { loaders, get } = buildLoaders()

    expect(await loaders.loadContributor("kgs")).toEqual(
      contributor,
    )
    expect(get).toHaveBeenCalledWith({ slug: "kgs" })
  })

  it("is a 404 for an unknown slug", async () => {
    const { loaders } = buildLoaders({
      get: vi.fn(async () => succeed(null)),
    })

    await expect(
      loaders.loadContributor("ghost"),
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(notFound).toHaveBeenCalled()
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { loaders } = buildLoaders({
      get: vi.fn(async () => fail(cause)),
    })

    await expect(
      loaders.loadContributor("kgs"),
    ).rejects.toBe(cause)
  })
})
