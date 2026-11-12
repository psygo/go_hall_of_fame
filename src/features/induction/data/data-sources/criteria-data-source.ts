import { asc } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import { criteriaTable } from "@/shared/database/data/schema"

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
}
