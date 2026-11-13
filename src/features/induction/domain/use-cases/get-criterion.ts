import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { Criterion } from "../entities/criterion"
import type { IdParams } from "../params/id-params"
import type { CriteriaRepository } from "../repositories/criteria-repository"

export class GetCriterion implements UseCase<
  IdParams,
  DataState<Criterion | null>
> {
  constructor(
    private readonly criteria: CriteriaRepository,
  ) {}

  call({ id }: IdParams) {
    return this.criteria.findById(id)
  }
}
