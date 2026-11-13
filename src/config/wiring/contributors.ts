import "server-only"

import { ContributorsDataSource } from "@/features/contributors/data/data-sources/contributors-data-source"
import { ContributorsRepositoryImpl } from "@/features/contributors/data/repositories/contributors-repository-impl"
import { DeleteContributor } from "@/features/contributors/domain/use-cases/delete-contributor"
import { GetContributor } from "@/features/contributors/domain/use-cases/get-contributor"
import { ListContributors } from "@/features/contributors/domain/use-cases/list-contributors"
import { SaveContributor } from "@/features/contributors/domain/use-cases/save-contributor"
import { createContributorsAdminState } from "@/features/contributors/presentation/state/contributors-admin-state"
import { createContributorsLoaders } from "@/features/contributors/presentation/state/contributors-loaders"

import { canSeeDrafts, requireAdmin } from "./auth"
import { database } from "./infrastructure"

const repository = new ContributorsRepositoryImpl(
  new ContributorsDataSource(database),
  canSeeDrafts,
)
const listContributors = new ListContributors(repository)
const getContributor = new GetContributor(repository)

export const contributorsLoaders =
  createContributorsLoaders({
    listContributors,
    getContributor,
  })

export const contributorsAdminState =
  createContributorsAdminState({
    requireAdmin,
    listContributors,
    getContributor,
    saveContributor: new SaveContributor(repository),
    deleteContributor: new DeleteContributor(repository),
  })
