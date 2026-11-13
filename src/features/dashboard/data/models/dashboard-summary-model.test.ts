import { describe, expect, it } from "vitest"

import { InvalidRawDataError } from "@/core/raw-data"

import { DashboardSummaryModel } from "./dashboard-summary-model"

const validRaw = {
  playerCount: 12,
  gameCount: 9,
  timelineEventCount: 20,
  criterionCount: 4,
  pendingNominationCount: 3,
}

describe("DashboardSummaryModel", () => {
  it("parses valid raw data", () => {
    const model =
      DashboardSummaryModel.fromRawData(validRaw)

    expect(model.playerCount).toBe(12)
    expect(model.pendingNominationCount).toBe(3)
  })

  it("accepts zero counts", () => {
    expect(
      DashboardSummaryModel.fromRawData({
        playerCount: 0,
        gameCount: 0,
        timelineEventCount: 0,
        criterionCount: 0,
        pendingNominationCount: 0,
      }).toEntity(),
    ).toEqual({
      playerCount: 0,
      gameCount: 0,
      timelineEventCount: 0,
      criterionCount: 0,
      pendingNominationCount: 0,
    })
  })

  it.each(Object.keys(validRaw))(
    "throws when %s is missing",
    (key) => {
      const raw: Record<string, unknown> = { ...validRaw }
      delete raw[key]

      expect(() =>
        DashboardSummaryModel.fromRawData(raw),
      ).toThrow(InvalidRawDataError)
    },
  )

  it.each([
    ["a string", "12"],
    ["a fraction", 1.5],
    ["null", null],
  ])("throws when a count is %s", (_label, value) => {
    expect(() =>
      DashboardSummaryModel.fromRawData({
        ...validRaw,
        gameCount: value,
      }),
    ).toThrow('"gameCount" must be an integer')
  })

  it("throws when the raw data is not an object", () => {
    expect(() =>
      DashboardSummaryModel.fromRawData(undefined),
    ).toThrow("dashboard summary must be an object")
  })

  it("converts to a plain entity equal to the fields", () => {
    const entity =
      DashboardSummaryModel.fromRawData(validRaw).toEntity()

    expect(entity).toEqual(validRaw)
    expect(Object.getPrototypeOf(entity)).toBe(
      Object.prototype,
    )
  })
})
