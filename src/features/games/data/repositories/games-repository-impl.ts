import { captureDataState } from "@/core/data-state"
import type { CanSeeDrafts } from "@/core/draft-visibility"

import type { GameDraft } from "../../domain/entities/game-draft"
import type { GamesRepository } from "../../domain/repositories/games-repository"
import type { GamesDataSource } from "../data-sources/games-data-source"

export class GamesRepositoryImpl implements GamesRepository {
  constructor(
    private readonly dataSource: GamesDataSource,
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

  findSgfTextBySlug(slug: string) {
    return captureDataState(async () =>
      this.dataSource.fetchSgfTextBySlug(
        slug,
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

  save(draft: GameDraft, originalSlug: string | null) {
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
