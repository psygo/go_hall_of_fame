import { captureDataState } from "@/core/data-state"

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
}
