import { captureDataState } from "@/core/data-state"

import type { PlayersRepository } from "../../domain/repositories/players-repository"
import type { PlayersDataSource } from "../data-sources/players-data-source"

export class PlayersRepositoryImpl implements PlayersRepository {
  constructor(
    private readonly dataSource: PlayersDataSource,
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
