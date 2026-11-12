import { describe, expect, it, vi } from "vitest"

import type { HomeDataSource } from "../data-sources/home-data-source"
import { HomeFactsModel } from "../models/home-facts-model"
import { HomeRepositoryImpl } from "./home-repository-impl"

const rawFacts = {
  playerCount: 3,
  gameCount: 2,
  firstYear: 1612,
  lastYear: 2019,
  featuredGame: null,
  featuredPlayer: null,
}

function buildRepository(
  fetchFacts: ReturnType<typeof vi.fn>,
) {
  return new HomeRepositoryImpl({
    fetchFacts,
  } as unknown as HomeDataSource)
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
})
