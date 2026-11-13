import { succeed, type DataState } from "@/core/data-state"
import { paginate, type Page } from "@/core/list-query"
import type { UseCase } from "@/core/use-case"

import {
  CRITERIA_PAGE_SIZE,
  orderCriteria,
  type Criterion,
} from "../entities/criterion"
import type { PageCriteriaParams } from "../params/page-criteria-params"
import type { CriteriaRepository } from "../repositories/criteria-repository"

export class PageCriteria implements UseCase<
  PageCriteriaParams,
  DataState<Page<Criterion>>
> {
  constructor(
    private readonly criteria: CriteriaRepository,
  ) {}

  async call({ order, page }: PageCriteriaParams) {
    const all = await this.criteria.listAll()
    if (all.status === "failure") return all
    return succeed(
      paginate(
        orderCriteria(all.data, order),
        page,
        CRITERIA_PAGE_SIZE,
      ),
    )
  }
}
