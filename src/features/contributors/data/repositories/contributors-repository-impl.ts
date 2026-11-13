import { captureDataState } from "@/core/data-state"
import type { CanSeeDrafts } from "@/core/draft-visibility"

import type { ContributorDraft } from "../../domain/entities/contributor-draft"
import type { ContributorsRepository } from "../../domain/repositories/contributors-repository"
import type { ContributorsDataSource } from "../data-sources/contributors-data-source"

export class ContributorsRepositoryImpl implements ContributorsRepository {
  constructor(
    private readonly dataSource: ContributorsDataSource,
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

  findBySlug(slug: string) {
    return captureDataState(async () => {
      const model = await this.dataSource.fetchBySlug(
        slug,
        await this.canSeeDrafts(),
      )
      return model === null ? null : model.toEntity()
    })
  }

  save(
    draft: ContributorDraft,
    originalSlug: string | null,
  ) {
    return captureDataState(() =>
      this.dataSource.upsert(draft, originalSlug),
    )
  }

  deleteBySlug(slug: string) {
    return captureDataState(() =>
      this.dataSource.deleteBySlug(slug),
    )
  }
}
