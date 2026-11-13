import { asRecord, readInteger } from "@/core/raw-data"

import type { DashboardSummary } from "../../domain/entities/dashboard-summary"

export class DashboardSummaryModel implements DashboardSummary {
  declare readonly playerCount: number
  declare readonly gameCount: number
  declare readonly timelineEventCount: number
  declare readonly criterionCount: number
  declare readonly pendingNominationCount: number

  private constructor(fields: DashboardSummary) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): DashboardSummaryModel {
    const record = asRecord(raw, "dashboard summary")
    return new DashboardSummaryModel({
      playerCount: readInteger(record, "playerCount"),
      gameCount: readInteger(record, "gameCount"),
      timelineEventCount: readInteger(
        record,
        "timelineEventCount",
      ),
      criterionCount: readInteger(record, "criterionCount"),
      pendingNominationCount: readInteger(
        record,
        "pendingNominationCount",
      ),
    })
  }

  toEntity(): DashboardSummary {
    return { ...this }
  }
}
