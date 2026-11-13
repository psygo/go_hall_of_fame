import { describe, expect, it, vi } from "vitest"

import type { HomeDataSource } from "../data-sources/home-data-source"
import { HomeFactsModel } from "../models/home-facts-model"
import { HomeRepositoryImpl } from "./home-repository-impl"

const rawFacts = {
  playerCount: 3,
  gameCount: 2,
  firstYear: 1612,
  lastYear: 2019,
  spotlightGame: null,
  spotlightPlayer: null,
}

function buildRepository(
  fetchFacts: ReturnType<typeof vi.fn>,
  canSeeDrafts: () => Promise<boolean> = async () => false,
) {
  return new HomeRepositoryImpl(
    { fetchFacts } as unknown as HomeDataSource,
    canSeeDrafts,
  )
}

describe("HomeRepositoryImpl", () => {
  it("maps the facts model to a plain entity", async () => {
    const repository = buildRepository(
      vi.fn(async () =>
        HomeFactsModel.fromRawData(rawFacts),
      ),
    )

    const state = await repository.getFacts()

    expect(state).toEqual({
      status: "success",
      data: rawFacts,
    })
    if (state.status === "success") {
      expect(Object.getPrototypeOf(state.data)).toBe(
        Object.prototype,
      )
    }
  })

  it("returns a failure when the data source throws", async () => {
    const cause = new Error("db down")
    const repository = buildRepository(
      vi.fn(async () => {
        throw cause
      }),
    )

    expect(await repository.getFacts()).toEqual({
      status: "failure",
      error: cause,
    })
  })

  it.each([
    [true, true],
    [false, false],
  ])(
    "canSeeDrafts %s gives includeDrafts %s",
    async (canSee, expected) => {
      const fetchFacts = vi.fn(async () =>
        HomeFactsModel.fromRawData(rawFacts),
      )

      await buildRepository(
        fetchFacts,
        async () => canSee,
      ).getFacts()

      expect(fetchFacts).toHaveBeenCalledWith(expected)
    },
  )

  it("evaluates canSeeDrafts on every call", async () => {
    const fetchFacts = vi.fn(async () =>
      HomeFactsModel.fromRawData(rawFacts),
    )
    let admin = true
    const repository = buildRepository(
      fetchFacts,
      async () => admin,
    )

    await repository.getFacts()
    admin = false
    await repository.getFacts()

    expect(fetchFacts.mock.calls).toEqual([[true], [false]])
  })

  it("turns a rejecting canSeeDrafts into a failure without reading", async () => {
    const cause = new Error("auth down")
    const fetchFacts = vi.fn()
    const repository = buildRepository(
      fetchFacts,
      async () => {
        throw cause
      },
    )

    expect(await repository.getFacts()).toEqual({
      status: "failure",
      error: cause,
    })
    expect(fetchFacts).not.toHaveBeenCalled()
  })
})
