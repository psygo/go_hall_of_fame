import { notFound } from "next/navigation"
import { connection } from "next/server"
import { cache } from "react"

import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { Contributor } from "../../domain/entities/contributor"
import type { ContributorSlugParams } from "../../domain/params/contributor-slug-params"

export type ContributorsLoaderDependencies = {
  readonly listContributors: UseCase<
    NoParams,
    DataState<readonly Contributor[]>
  >
  readonly getContributor: UseCase<
    ContributorSlugParams,
    DataState<Contributor | null>
  >
}

export function createContributorsLoaders(
  dependencies: ContributorsLoaderDependencies,
) {
  async function loadContributors(): Promise<
    readonly Contributor[]
  > {
    await connection()
    return unwrapDataState(
      await dependencies.listContributors.call({}),
    )
  }

  const loadContributor = cache(
    async (slug: string): Promise<Contributor> => {
      await connection()
      const contributor = unwrapDataState(
        await dependencies.getContributor.call({ slug }),
      )
      if (contributor === null) notFound()
      return contributor
    },
  )

  return { loadContributors, loadContributor }
}
