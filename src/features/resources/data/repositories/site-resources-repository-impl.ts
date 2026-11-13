import { captureDataState } from "@/core/data-state"
import type { ResourceLink } from "@/core/resources"

import type { SiteResourcesRepository } from "../../domain/repositories/site-resources-repository"
import type { SiteResourcesDataSource } from "../data-sources/site-resources-data-source"

export class SiteResourcesRepositoryImpl implements SiteResourcesRepository {
  constructor(
    private readonly dataSource: SiteResourcesDataSource,
  ) {}

  listAll() {
    return captureDataState(async () => {
      const models = await this.dataSource.fetchAll()
      return models.map((model) => model.toEntity())
    })
  }

  replaceAll(links: readonly ResourceLink[]) {
    return captureDataState(() =>
      this.dataSource.replaceAll(links),
    )
  }
}
