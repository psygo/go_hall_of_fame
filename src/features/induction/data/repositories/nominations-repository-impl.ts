import { captureDataState } from "@/core/data-state"

import type { NominationDraft } from "../../domain/entities/nomination"
import type { NominationStatus } from "../../domain/entities/nomination-record"
import type { NominationsRepository } from "../../domain/repositories/nominations-repository"
import type { NominationsDataSource } from "../data-sources/nominations-data-source"

export class NominationsRepositoryImpl implements NominationsRepository {
  constructor(
    private readonly dataSource: NominationsDataSource,
  ) {}

  submit(draft: NominationDraft) {
    return captureDataState(() =>
      this.dataSource.insert(draft),
    )
  }

  listAll() {
    return captureDataState(async () => {
      const models = await this.dataSource.fetchAll()
      return models.map((model) => model.toEntity())
    })
  }

  updateStatus(id: number, status: NominationStatus) {
    return captureDataState(() =>
      this.dataSource.updateStatus(id, status),
    )
  }

  delete(id: number) {
    return captureDataState(() =>
      this.dataSource.delete(id),
    )
  }
}
