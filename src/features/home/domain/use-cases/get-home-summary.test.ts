import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { HomeFacts } from "../entities/home-summary"
import type { HomeRepository } from "../repositories/home-repository"
import { GetHomeSummary } from "./get-home-summary"

const facts: HomeFacts = {
  playerCount: 3,
  gameCount: 2,
  firstYear: 1612,
  lastYear: 2019,
  spotlightGame: null,
  spotlightPlayer: null,
}

describe("GetHomeSummary", () => {
  it("summarizes the facts of the repository", async () => {
    const repository: HomeRepository = {
      getFacts: vi.fn(async () => succeed(facts)),
    }

    expect(
      await new GetHomeSummary(repository).call(),
    ).toEqual(
      succeed({
        playerCount: 3,
        gameCount: 2,
        spotlightGame: null,
        spotlightPlayer: null,
        centuries: 4,
      }),
    )
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))
    const repository: HomeRepository = {
      getFacts: vi.fn(async () => failure),
    }

    expect(
      await new GetHomeSummary(repository).call(),
    ).toBe(failure)
  })
})
