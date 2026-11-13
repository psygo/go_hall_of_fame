import { inArray, sql } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import { siteTextsTable } from "@/shared/database/data/schema"

import type { SiteTextChanges } from "../../domain/entities/page-text"
import { SiteTextModel } from "../models/site-text-model"

export class SiteTextsDataSource {
  constructor(private readonly database: Database) {}

  async fetchAll(): Promise<SiteTextModel[]> {
    const rows = await this.database
      .select()
      .from(siteTextsTable)
    return rows.map((row) => SiteTextModel.fromRawData(row))
  }

  async apply(changes: SiteTextChanges): Promise<void> {
    const rows = Object.entries(changes.set).map(
      ([key, value]) => ({
        key,
        value,
      }),
    )
    await this.database.transaction(async (tx) => {
      if (rows.length > 0) {
        await tx
          .insert(siteTextsTable)
          .values(rows)
          .onConflictDoUpdate({
            target: siteTextsTable.key,
            set: {
              value: sql`excluded.value`,
              updatedAt: sql`now()`,
            },
          })
      }
      if (changes.clear.length > 0) {
        await tx
          .delete(siteTextsTable)
          .where(
            inArray(siteTextsTable.key, [...changes.clear]),
          )
      }
    })
  }
}
