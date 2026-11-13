import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { DashboardRepository } from "../repositories/dashboard-repository"
import { GetDashboardSummary } from "./get-dashboard-summary"

function buildRepository(
  getSummary: DashboardRepository["getSummary"],
): DashboardRepository {
  return { getSummary } as unknown as DashboardRepository
}

describe("GetDashboardSummary", () => {
  it("returns the result of the repository", async () => {
    const data = {
      playerCount: 1,
      gameCount: 2,
      timelineEventCount: 3,
      criterionCount: 4,
      pendingNominationCount: 5,
    }
    const getSummary = vi.fn(async () => succeed(data))
    const repo = buildRepository(getSummary)

    const result = await new GetDashboardSummary(
      repo,
    ).call()

    expect(repo.getSummary).toHaveBeenCalledTimes(1)
    expect(result).toEqual(succeed(data))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    const result = await new GetDashboardSummary(
      buildRepository(vi.fn(async () => failure)),
    ).call()

    expect(result).toBe(failure)
  })
})
