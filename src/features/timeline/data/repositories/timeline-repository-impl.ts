import { captureDataState } from "@/core/data-state"

import type { TimelineEventDraft } from "../../domain/entities/timeline-event-draft"
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

  findById(id: number) {
    return captureDataState(async () => {
      const model = await this.dataSource.fetchById(id)
      return model === null ? null : model.toEntity()
    })
  }

  listGameOptions() {
    return captureDataState(() =>
      this.dataSource.listGameOptions(),
    )
  }

  save(draft: TimelineEventDraft, id: number | null) {
    return captureDataState(() =>
      this.dataSource.upsert(draft, id),
    )
  }

  reorder(ids: readonly number[]) {
    return captureDataState(() =>
      this.dataSource.reorder(ids),
    )
  }

  delete(id: number) {
    return captureDataState(() =>
      this.dataSource.delete(id),
    )
  }
}
