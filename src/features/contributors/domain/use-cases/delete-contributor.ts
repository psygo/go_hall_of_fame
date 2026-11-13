import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { ContributorSlugParams } from "../params/contributor-slug-params"
import type { ContributorsRepository } from "../repositories/contributors-repository"

export class DeleteContributor implements UseCase<
  ContributorSlugParams,
  DataState<void>
> {
  constructor(
    private readonly contributors: ContributorsRepository,
  ) {}

  call({ slug }: ContributorSlugParams) {
    return this.contributors.deleteBySlug(slug)
  }
}
