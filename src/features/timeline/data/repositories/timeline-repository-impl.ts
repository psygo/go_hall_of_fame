import { captureDataState } from "@/core/data-state"

import type { TimelineRepository } from "../../domain/repositories/timeline-repository"
import type { TimelineDataSource } from "../data-sources/timeline-data-source"

export class TimelineRepositoryImpl implements TimelineRepository {
  constructor(
    private readonly dataSource: TimelineDataSource,
  ) {}

  listAll() {
    return captureDataState(async () => {
      const models = await this.dataSource.fetchAll()
      return models.map((model) => model.toEntity())
    })
  }
}
