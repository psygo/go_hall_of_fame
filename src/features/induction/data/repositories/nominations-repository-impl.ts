import { captureDataState } from "@/core/data-state"

import type { NominationDraft } from "../../domain/entities/nomination"
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
}
