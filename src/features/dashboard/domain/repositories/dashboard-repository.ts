import type { DataState } from "@/core/data-state"

import type { DashboardSummary } from "../entities/dashboard-summary"

export interface DashboardRepository {
  getSummary(): Promise<DataState<DashboardSummary>>
}
