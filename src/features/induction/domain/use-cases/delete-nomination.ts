import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { IdParams } from "../params/id-params"
import type { NominationsRepository } from "../repositories/nominations-repository"

export class DeleteNomination implements UseCase<
  IdParams,
  DataState<void>
> {
  constructor(
    private readonly nominations: NominationsRepository,
  ) {}

  call({ id }: IdParams) {
    return this.nominations.delete(id)
  }
}
