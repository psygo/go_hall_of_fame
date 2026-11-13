import { asc, eq } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import { criteriaTable } from "@/shared/database/data/schema"

import type { CriterionDraft } from "../../domain/entities/criterion-draft"
import { CriterionModel } from "../models/criterion-model"

export class CriteriaDataSource {
  constructor(private readonly database: Database) {}

  async fetchAll(): Promise<CriterionModel[]> {
    const rows = await this.database
      .select()
      .from(criteriaTable)
      .orderBy(asc(criteriaTable.position))
    return rows.map((row) =>
      CriterionModel.fromRawData(row),
    )
  }

  async fetchById(
    id: number,
  ): Promise<CriterionModel | null> {
    const [row] = await this.database
      .select()
      .from(criteriaTable)
      .where(eq(criteriaTable.id, id))
    return row === undefined
      ? null
      : CriterionModel.fromRawData(row)
  }

  async upsert(
    draft: CriterionDraft,
    id: number | null,
  ): Promise<void> {
    if (id === null) {
      await this.database
        .insert(criteriaTable)
        .values(draft)
      return
    }
    await this.database
      .update(criteriaTable)
      .set(draft)
      .where(eq(criteriaTable.id, id))
  }

  async delete(id: number): Promise<void> {
    await this.database
      .delete(criteriaTable)
      .where(eq(criteriaTable.id, id))
  }
}
