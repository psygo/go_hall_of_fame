import { connection } from "next/server"

import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import type { RequireAdmin } from "@/core/admin-guard"
import type { NoParams, UseCase } from "@/core/use-case"

import type { DashboardSummary } from "../../domain/entities/dashboard-summary"

export type DashboardDependencies = {
  readonly requireAdmin: RequireAdmin
  readonly getDashboardSummary: UseCase<
    NoParams,
    DataState<DashboardSummary>
  >
}

export function createDashboardState(
  dependencies: DashboardDependencies,
) {
  async function loadDashboard(): Promise<DashboardSummary> {
    await connection()
    await dependencies.requireAdmin()
    return unwrapDataState(
      await dependencies.getDashboardSummary.call({}),
    )
  }

  return { loadDashboard }
}
