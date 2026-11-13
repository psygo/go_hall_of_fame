import "server-only"

import { DashboardDataSource } from "@/features/dashboard/data/data-sources/dashboard-data-source"
import { DashboardRepositoryImpl } from "@/features/dashboard/data/repositories/dashboard-repository-impl"
import { GetDashboardSummary } from "@/features/dashboard/domain/use-cases/get-dashboard-summary"
import { createDashboardState } from "@/features/dashboard/presentation/state/dashboard-state"

import { requireAdmin } from "./auth"
import { database } from "./infrastructure"

export const dashboardState = createDashboardState({
  requireAdmin,
  getDashboardSummary: new GetDashboardSummary(
    new DashboardRepositoryImpl(
      new DashboardDataSource(database),
    ),
  ),
})
