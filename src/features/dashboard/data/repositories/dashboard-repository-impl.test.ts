import { describe, expect, it, vi } from "vitest"

import type { DashboardDataSource } from "../data-sources/dashboard-data-source"
import { DashboardSummaryModel } from "../models/dashboard-summary-model"
import { DashboardRepositoryImpl } from "./dashboard-repository-impl"

const rawSummary = {
  playerCount: 12,
  gameCount: 9,
  timelineEventCount: 20,
  criterionCount: 4,
  pendingNominationCount: 3,
}

function buildRepository(
  fetchSummary: ReturnType<typeof vi.fn>,
) {
  return new DashboardRepositoryImpl({
    fetchSummary,
  } as unknown as DashboardDataSource)
}

describe("DashboardRepositoryImpl", () => {
  it("maps the summary model to a plain entity", async () => {
    const repository = buildRepository(
      vi.fn(async () =>
        DashboardSummaryModel.fromRawData(rawSummary),
      ),
    )

    const state = await repository.getSummary()

    expect(state).toEqual({
      status: "success",
      data: rawSummary,
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

    expect(await repository.getSummary()).toEqual({
      status: "failure",
      error: cause,
    })
  })
})
