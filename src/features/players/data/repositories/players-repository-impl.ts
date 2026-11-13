import { captureDataState } from "@/core/data-state"
import type { CanSeeDrafts } from "@/core/draft-visibility"

import type { PlayerDraft } from "../../domain/entities/player-draft"
import type { PlayersRepository } from "../../domain/repositories/players-repository"
import type { PlayersDataSource } from "../data-sources/players-data-source"

export class PlayersRepositoryImpl implements PlayersRepository {
  constructor(
    private readonly dataSource: PlayersDataSource,
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

  findDetailBySlug(slug: string) {
    return captureDataState(async () => {
      const model = await this.dataSource.fetchDetailBySlug(
        slug,
        await this.canSeeDrafts(),
      )
      return model === null ? null : model.toEntity()
    })
  }

  save(draft: PlayerDraft, originalSlug: string | null) {
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
