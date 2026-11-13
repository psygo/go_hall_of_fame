import { and, asc, eq } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import { isVisible } from "@/shared/database/data/drafts"
import { contributorsTable } from "@/shared/database/data/schema"

import type { ContributorDraft } from "../../domain/entities/contributor-draft"
import { ContributorModel } from "../models/contributor-model"

export class ContributorsDataSource {
  constructor(private readonly database: Database) {}

  async fetchAll(
    includeDrafts: boolean,
  ): Promise<ContributorModel[]> {
    const rows = await this.database
      .select()
      .from(contributorsTable)
      .where(isVisible(contributorsTable, includeDrafts))
      .orderBy(
        asc(contributorsTable.name),
        asc(contributorsTable.id),
      )
    return rows.map((row) =>
      ContributorModel.fromRawData(row),
    )
  }

  async fetchBySlug(
    slug: string,
    includeDrafts: boolean,
  ): Promise<ContributorModel | null> {
    const [row] = await this.database
      .select()
      .from(contributorsTable)
      .where(
        and(
          eq(contributorsTable.slug, slug),
          isVisible(contributorsTable, includeDrafts),
        ),
      )
    return row === undefined
      ? null
      : ContributorModel.fromRawData(row)
  }

  async upsert(
    draft: ContributorDraft,
    originalSlug: string | null,
  ): Promise<void> {
    if (originalSlug === null) {
      await this.database
        .insert(contributorsTable)
        .values(draft)
      return
    }
    const updated = await this.database
      .update(contributorsTable)
      .set(draft)
      .where(eq(contributorsTable.slug, originalSlug))
      .returning({ id: contributorsTable.id })
    if (updated.length === 0) {
      throw new Error(
        "The contributor to update was not found",
      )
    }
  }

  async deleteBySlug(slug: string): Promise<void> {
    await this.database
      .delete(contributorsTable)
      .where(eq(contributorsTable.slug, slug))
  }
}
