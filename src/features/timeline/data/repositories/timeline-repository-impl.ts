import { captureDataState } from "@/core/data-state"
import type { CanSeeDrafts } from "@/core/draft-visibility"

import type { TimelineEventDraft } from "../../domain/entities/timeline-event-draft"
import type { TimelineRepository } from "../../domain/repositories/timeline-repository"
import type { TimelineDataSource } from "../data-sources/timeline-data-source"

export class TimelineRepositoryImpl implements TimelineRepository {
  constructor(
    private readonly dataSource: TimelineDataSource,
    private readonly canSeeDrafts: CanSeeDrafts,
  ) {}

  listAll() {
    return captureDataState(async () => {
      const models = await this.dataSource.fetchAll(
        await this.canSeeDrafts(),
      )
      return models.map((model) => model.toEntity())
    })
  }

  findById(id: number) {
    return captureDataState(async () => {
      const model = await this.dataSource.fetchById(
        id,
        await this.canSeeDrafts(),
      )
      return model === null ? null : model.toEntity()
    })
  }

  listGameOptions() {
    return captureDataState(async () =>
      this.dataSource.listGameOptions(
        await this.canSeeDrafts(),
      ),
    )
  }

  listPlayerOptions() {
    return captureDataState(async () =>
      this.dataSource.listPlayerOptions(
        await this.canSeeDrafts(),
      ),
    )
  }

  listContributorOptions() {
    return captureDataState(async () =>
      this.dataSource.listContributorOptions(
        await this.canSeeDrafts(),
      ),
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
