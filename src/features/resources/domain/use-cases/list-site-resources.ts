import type { DataState } from "@/core/data-state"
import type { ResourceLink } from "@/core/resources"
import type { NoParams, UseCase } from "@/core/use-case"

import type { SiteResourcesRepository } from "../repositories/site-resources-repository"

export class ListSiteResources implements UseCase<
  NoParams,
  DataState<readonly ResourceLink[]>
> {
  constructor(
    private readonly resources: SiteResourcesRepository,
  ) {}

  call() {
    return this.resources.listAll()
  }
}
