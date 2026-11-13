import { captureDataState } from "@/core/data-state"

import type { SiteTextChanges } from "../../domain/entities/page-text"
import type { SiteTextsRepository } from "../../domain/repositories/site-texts-repository"
import type { SiteTextsDataSource } from "../data-sources/site-texts-data-source"

export class SiteTextsRepositoryImpl implements SiteTextsRepository {
  constructor(
    private readonly dataSource: SiteTextsDataSource,
  ) {}

  listOverrides() {
    return captureDataState(async () => {
      const models = await this.dataSource.fetchAll()
      return Object.fromEntries(
        models.map((model) => {
          const { key, value } = model.toEntity()
          return [key, value]
        }),
      )
    })
  }

  apply(changes: SiteTextChanges) {
    return captureDataState(() =>
      this.dataSource.apply(changes),
    )
  }
}
