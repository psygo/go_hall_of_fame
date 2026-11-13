import { desc, eq } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import { nominationsTable } from "@/shared/database/data/schema"

import type { NominationDraft } from "../../domain/entities/nomination"
import type { NominationStatus } from "../../domain/entities/nomination-record"
import { NominationRecordModel } from "../models/nomination-record-model"

export class NominationsDataSource {
  constructor(private readonly database: Database) {}

  async insert(draft: NominationDraft): Promise<void> {
    await this.database
      .insert(nominationsTable)
      .values(draft)
  }

  async fetchAll(): Promise<NominationRecordModel[]> {
    const rows = await this.database
      .select()
      .from(nominationsTable)
      .orderBy(
        desc(nominationsTable.createdAt),
        desc(nominationsTable.id),
      )
    return rows.map((row) =>
      NominationRecordModel.fromRawData(row),
    )
  }

  async updateStatus(
    id: number,
    status: NominationStatus,
  ): Promise<void> {
    await this.database
      .update(nominationsTable)
      .set({ status })
      .where(eq(nominationsTable.id, id))
  }

  async delete(id: number): Promise<void> {
    await this.database
      .delete(nominationsTable)
      .where(eq(nominationsTable.id, id))
  }
}
