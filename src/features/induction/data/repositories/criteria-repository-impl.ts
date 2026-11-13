import { captureDataState } from "@/core/data-state"

import type { CriterionDraft } from "../../domain/entities/criterion-draft"
import type { CriteriaRepository } from "../../domain/repositories/criteria-repository"
import type { CriteriaDataSource } from "../data-sources/criteria-data-source"

export class CriteriaRepositoryImpl implements CriteriaRepository {
  constructor(
    private readonly dataSource: CriteriaDataSource,
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

  save(draft: CriterionDraft, id: number | null) {
    return captureDataState(() =>
      this.dataSource.upsert(draft, id),
    )
  }

  delete(id: number) {
    return captureDataState(() =>
      this.dataSource.delete(id),
    )
  }
}
