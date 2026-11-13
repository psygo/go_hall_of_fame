import type { DataState } from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { Contributor } from "../entities/contributor"
import type { ContributorsRepository } from "../repositories/contributors-repository"

export class ListContributors implements UseCase<
  NoParams,
  DataState<readonly Contributor[]>
> {
  constructor(
    private readonly contributors: ContributorsRepository,
  ) {}

  call() {
    return this.contributors.listAll()
  }
}
