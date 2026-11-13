import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { Contributor } from "../entities/contributor"
import type { ContributorSlugParams } from "../params/contributor-slug-params"
import type { ContributorsRepository } from "../repositories/contributors-repository"

export class GetContributor implements UseCase<
  ContributorSlugParams,
  DataState<Contributor | null>
> {
  constructor(
    private readonly contributors: ContributorsRepository,
  ) {}

  call({ slug }: ContributorSlugParams) {
    return this.contributors.findBySlug(slug)
  }
}
