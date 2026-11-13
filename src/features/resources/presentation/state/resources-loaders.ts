import { connection } from "next/server"

import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import {
  readPageParam,
  type Page,
  type QueryParam,
} from "@/core/list-query"
import type { ResourceLink } from "@/core/resources"
import type { UseCase } from "@/core/use-case"

import type { PageSiteResourcesParams } from "../../domain/params/page-site-resources-params"

export type ResourcesLoaderDependencies = {
  readonly pageSiteResources: UseCase<
    PageSiteResourcesParams,
    DataState<Page<ResourceLink>>
  >
}

export type ResourcesSearchParams = {
  readonly page?: QueryParam
}

export function createResourcesLoaders(
  dependencies: ResourcesLoaderDependencies,
) {
  async function loadResourcesPage(
    params: ResourcesSearchParams,
  ): Promise<Page<ResourceLink>> {
    await connection()
    return unwrapDataState(
      await dependencies.pageSiteResources.call({
        page: readPageParam(params.page),
      }),
    )
  }

  return { loadResourcesPage }
}
