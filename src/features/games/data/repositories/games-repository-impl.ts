import { captureDataState } from "@/core/data-state"

import type { GamesRepository } from "../../domain/repositories/games-repository"
import type { GamesDataSource } from "../data-sources/games-data-source"

export class GamesRepositoryImpl implements GamesRepository {
  constructor(
    private readonly dataSource: GamesDataSource,
  ) {}

  listAll() {
    return captureDataState(async () => {
      const models = await this.dataSource.fetchAll()
      return models.map((model) => model.toEntity())
    })
  }

  findDetailBySlug(slug: string) {
    return captureDataState(async () => {
      const model =
        await this.dataSource.fetchDetailBySlug(slug)
      return model === null ? null : model.toEntity()
    })
  }
}
