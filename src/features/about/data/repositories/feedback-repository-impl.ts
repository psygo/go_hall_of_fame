import { captureDataState } from "@/core/data-state"

import type { FeedbackDraft } from "../../domain/entities/feedback"
import type { FeedbackRepository } from "../../domain/repositories/feedback-repository"
import type { FeedbackDataSource } from "../data-sources/feedback-data-source"

export class FeedbackRepositoryImpl implements FeedbackRepository {
  constructor(
    private readonly dataSource: FeedbackDataSource,
  ) {}

  submit(draft: FeedbackDraft) {
    return captureDataState(() =>
      this.dataSource.insert(draft),
    )
  }

  listAll() {
    return captureDataState(async () => {
      const models = await this.dataSource.fetchAll()
      return models.map((model) => model.toEntity())
    })
  }

  setRead(id: number, isRead: boolean) {
    return captureDataState(() =>
      this.dataSource.setRead(id, isRead),
    )
  }

  delete(id: number) {
    return captureDataState(() =>
      this.dataSource.delete(id),
    )
  }
}
