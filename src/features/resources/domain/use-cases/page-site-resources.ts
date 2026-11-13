import { succeed, type DataState } from "@/core/data-state"
import { paginate, type Page } from "@/core/list-query"
import type { ResourceLink } from "@/core/resources"
import type { UseCase } from "@/core/use-case"

import { RESOURCES_PAGE_SIZE } from "../entities/site-resources"
import type { PageSiteResourcesParams } from "../params/page-site-resources-params"
import type { SiteResourcesRepository } from "../repositories/site-resources-repository"

export class PageSiteResources implements UseCase<
  PageSiteResourcesParams,
  DataState<Page<ResourceLink>>
> {
  constructor(
    private readonly resources: SiteResourcesRepository,
  ) {}

  async call({ page }: PageSiteResourcesParams) {
    const all = await this.resources.listAll()
    if (all.status === "failure") return all
    return succeed(
      paginate(all.data, page, RESOURCES_PAGE_SIZE),
    )
  }
}
