import "server-only"

import { SiteTextsDataSource } from "@/features/content/data/data-sources/site-texts-data-source"
import { SiteTextsRepositoryImpl } from "@/features/content/data/repositories/site-texts-repository-impl"
import { GetPageTexts } from "@/features/content/domain/use-cases/get-page-texts"
import { ListEditableTexts } from "@/features/content/domain/use-cases/list-editable-texts"
import { SaveSiteTexts } from "@/features/content/domain/use-cases/save-site-texts"
import { createContentAdminState } from "@/features/content/presentation/state/content-admin-state"
import { createContentLoaders } from "@/features/content/presentation/state/content-loaders"

import { requireAdmin } from "./auth"
import { database } from "./infrastructure"

const siteTexts = new SiteTextsRepositoryImpl(
  new SiteTextsDataSource(database),
)

export const contentLoaders = createContentLoaders({
  getPageTexts: new GetPageTexts(siteTexts),
})

export const contentAdminState = createContentAdminState({
  requireAdmin,
  listEditableTexts: new ListEditableTexts(siteTexts),
  saveSiteTexts: new SaveSiteTexts(siteTexts),
})
