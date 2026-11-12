import type { DataState } from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { Criterion } from "../entities/criterion"
import type { CriteriaRepository } from "../repositories/criteria-repository"

export class ListCriteria implements UseCase<
  NoParams,
  DataState<readonly Criterion[]>
> {
  constructor(
    private readonly criteria: CriteriaRepository,
  ) {}

  call() {
    return this.criteria.listAll()
  }
}
