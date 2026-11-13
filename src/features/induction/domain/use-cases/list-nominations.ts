import type { DataState } from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { NominationRecord } from "../entities/nomination-record"
import type { NominationsRepository } from "../repositories/nominations-repository"

export class ListNominations implements UseCase<
  NoParams,
  DataState<readonly NominationRecord[]>
> {
  constructor(
    private readonly nominations: NominationsRepository,
  ) {}

  call() {
    return this.nominations.listAll()
  }
}
