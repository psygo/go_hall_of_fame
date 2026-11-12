import type { DataState } from "@/core/data-state"

import type { Criterion } from "../entities/criterion"

export interface CriteriaRepository {
  listAll(): Promise<DataState<readonly Criterion[]>>
}
