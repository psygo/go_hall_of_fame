import { captureDataState } from "@/core/data-state"
import type { CanSeeDrafts } from "@/core/draft-visibility"

import type { HomeRepository } from "../../domain/repositories/home-repository"
import type { HomeDataSource } from "../data-sources/home-data-source"

export class HomeRepositoryImpl implements HomeRepository {
  constructor(
    private readonly dataSource: HomeDataSource,
    private readonly canSeeDrafts: CanSeeDrafts,
  ) {}

  getFacts() {
    return captureDataState(async () => {
      const model = await this.dataSource.fetchFacts(
        await this.canSeeDrafts(),
      )
      return model.toEntity()
    })
  }
}
