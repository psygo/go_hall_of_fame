import { describe, expect, it, vi } from "vitest"

vi.mock("next/server", () => ({
  connection: vi.fn(async () => undefined),
}))

import { fail, succeed } from "@/core/data-state"

import type { DashboardSummary } from "../../domain/entities/dashboard-summary"
import { createDashboardState } from "./dashboard-state"

const summary: DashboardSummary = {
  playerCount: 1,
  gameCount: 2,
  timelineEventCount: 3,
  criterionCount: 4,
  pendingNominationCount: 5,
}

function buildState({
  requireAdmin = vi.fn(async () => undefined),
  result = succeed(summary),
}: {
  requireAdmin?: ReturnType<typeof vi.fn>
  result?:
    | ReturnType<typeof succeed<DashboardSummary>>
    | ReturnType<typeof fail>
} = {}) {
  const getSummary = vi.fn(async () => result)
  return {
    state: createDashboardState({
      requireAdmin,
      getDashboardSummary: { call: getSummary },
    }),
    requireAdmin,
    getSummary,
  }
}

describe("loadDashboard", () => {
  it("returns the summary after checking the admin", async () => {
    const { state, requireAdmin, getSummary } = buildState()

    expect(await state.loadDashboard()).toEqual(summary)
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(getSummary.mock.invocationCallOrder[0])
  })

  it("does not read the summary when the admin check rejects", async () => {
    const { state, getSummary } = buildState({
      requireAdmin: vi.fn(async () => {
        throw new Error("NEXT_REDIRECT:/admin/sign-in")
      }),
    })

    await expect(state.loadDashboard()).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(getSummary).not.toHaveBeenCalled()
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { state } = buildState({ result: fail(cause) })

    await expect(state.loadDashboard()).rejects.toBe(cause)
  })
})
