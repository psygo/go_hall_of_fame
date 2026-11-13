import { desc, eq } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import { feedbackTable } from "@/shared/database/data/schema"

import type { FeedbackDraft } from "../../domain/entities/feedback"
import { FeedbackRecordModel } from "../models/feedback-record-model"

export class FeedbackDataSource {
  constructor(private readonly database: Database) {}

  async insert(draft: FeedbackDraft): Promise<void> {
    await this.database.insert(feedbackTable).values(draft)
  }

  async fetchAll(): Promise<FeedbackRecordModel[]> {
    const rows = await this.database
      .select()
      .from(feedbackTable)
      .orderBy(
        desc(feedbackTable.createdAt),
        desc(feedbackTable.id),
      )
    return rows.map((row) =>
      FeedbackRecordModel.fromRawData(row),
    )
  }

  async setRead(
    id: number,
    isRead: boolean,
  ): Promise<void> {
    await this.database
      .update(feedbackTable)
      .set({ isRead })
      .where(eq(feedbackTable.id, id))
  }

  async delete(id: number): Promise<void> {
    await this.database
      .delete(feedbackTable)
      .where(eq(feedbackTable.id, id))
  }
}
