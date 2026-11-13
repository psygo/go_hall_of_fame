import type { DataState } from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { DashboardSummary } from "../entities/dashboard-summary"
import type { DashboardRepository } from "../repositories/dashboard-repository"

export class GetDashboardSummary implements UseCase<
  NoParams,
  DataState<DashboardSummary>
> {
  constructor(
    private readonly dashboard: DashboardRepository,
  ) {}

  call() {
    return this.dashboard.getSummary()
  }
}
