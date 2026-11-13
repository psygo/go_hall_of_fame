import { captureDataState } from "@/core/data-state"

import type { DashboardRepository } from "../../domain/repositories/dashboard-repository"
import type { DashboardDataSource } from "../data-sources/dashboard-data-source"

export class DashboardRepositoryImpl implements DashboardRepository {
  constructor(
    private readonly dataSource: DashboardDataSource,
  ) {}

  getSummary() {
    return captureDataState(async () => {
      const model = await this.dataSource.fetchSummary()
      return model.toEntity()
    })
  }
}
