import type { DataState } from "@/core/data-state"

import type { Criterion } from "../entities/criterion"
import type { CriterionDraft } from "../entities/criterion-draft"

export interface CriteriaRepository {
  listAll(): Promise<DataState<readonly Criterion[]>>
  findById(id: number): Promise<DataState<Criterion | null>>
  /** Updates the criterion with `id`, or inserts a new one when `id` is null. */
  save(
    draft: CriterionDraft,
    id: number | null,
  ): Promise<DataState<void>>
  delete(id: number): Promise<DataState<void>>
}
