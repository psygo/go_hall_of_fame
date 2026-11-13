import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { SetNominationStatusParams } from "../params/set-nomination-status-params"
import type { NominationsRepository } from "../repositories/nominations-repository"

export class SetNominationStatus implements UseCase<
  SetNominationStatusParams,
  DataState<void>
> {
  constructor(
    private readonly nominations: NominationsRepository,
  ) {}

  call({ id, status }: SetNominationStatusParams) {
    return this.nominations.updateStatus(id, status)
  }
}
