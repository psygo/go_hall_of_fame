import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { IdParams } from "../params/id-params"
import type { CriteriaRepository } from "../repositories/criteria-repository"

export class DeleteCriterion implements UseCase<
  IdParams,
  DataState<void>
> {
  constructor(
    private readonly criteria: CriteriaRepository,
  ) {}

  call({ id }: IdParams) {
    return this.criteria.delete(id)
  }
}
