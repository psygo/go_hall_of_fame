import { eq, sql } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import {
  criteriaTable,
  gamesTable,
  nominationsTable,
  playersTable,
  timelineEventsTable,
} from "@/shared/database/data/schema"

import { DashboardSummaryModel } from "../models/dashboard-summary-model"

const countAll = sql<number>`count(*)::int`

export class DashboardDataSource {
  constructor(private readonly database: Database) {}

  async fetchSummary(): Promise<DashboardSummaryModel> {
    const [players, games, events, criteria, pending] =
      await Promise.all([
        this.database
          .select({ count: countAll })
          .from(playersTable),
        this.database
          .select({ count: countAll })
          .from(gamesTable),
        this.database
          .select({ count: countAll })
          .from(timelineEventsTable),
        this.database
          .select({ count: countAll })
          .from(criteriaTable),
        this.database
          .select({ count: countAll })
          .from(nominationsTable)
          .where(eq(nominationsTable.status, "pending")),
      ])
    return DashboardSummaryModel.fromRawData({
      playerCount: players[0].count,
      gameCount: games[0].count,
      timelineEventCount: events[0].count,
      criterionCount: criteria[0].count,
      pendingNominationCount: pending[0].count,
    })
  }
}
