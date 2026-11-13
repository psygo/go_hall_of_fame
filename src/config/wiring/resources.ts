import "server-only"

import { SiteResourcesDataSource } from "@/features/resources/data/data-sources/site-resources-data-source"
import { SiteResourcesRepositoryImpl } from "@/features/resources/data/repositories/site-resources-repository-impl"
import { ListSiteResources } from "@/features/resources/domain/use-cases/list-site-resources"
import { PageSiteResources } from "@/features/resources/domain/use-cases/page-site-resources"
import { SaveSiteResources } from "@/features/resources/domain/use-cases/save-site-resources"
import { createResourcesAdminState } from "@/features/resources/presentation/state/resources-admin-state"
import { createResourcesLoaders } from "@/features/resources/presentation/state/resources-loaders"

import { requireAdmin } from "./auth"
import { database } from "./infrastructure"

const repository = new SiteResourcesRepositoryImpl(
  new SiteResourcesDataSource(database),
)

export const resourcesLoaders = createResourcesLoaders({
  pageSiteResources: new PageSiteResources(repository),
})

export const resourcesAdminState =
  createResourcesAdminState({
    requireAdmin,
    listSiteResources: new ListSiteResources(repository),
    saveSiteResources: new SaveSiteResources(repository),
  })
