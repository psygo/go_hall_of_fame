import type { Database } from "@/shared/database/data/database"
import { nominationsTable } from "@/shared/database/data/schema"

import type { NominationDraft } from "../../domain/entities/nomination"

export class NominationsDataSource {
  constructor(private readonly database: Database) {}

  async insert(draft: NominationDraft): Promise<void> {
    await this.database
      .insert(nominationsTable)
      .values(draft)
  }
}
