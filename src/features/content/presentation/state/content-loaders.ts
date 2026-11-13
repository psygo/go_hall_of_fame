import { connection } from "next/server"
import { cache } from "react"

import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type {
  PageId,
  PageTexts,
} from "../../domain/entities/page-text"
import type { PageParams } from "../../domain/params/page-params"

export type ContentLoaderDependencies = {
  readonly getPageTexts: UseCase<
    PageParams,
    DataState<PageTexts>
  >
}

export function createContentLoaders(
  dependencies: ContentLoaderDependencies,
) {
  /** The editable copy of a public page, with the defaults filled in. */
  const loadPageTexts = cache(
    async (page: PageId): Promise<PageTexts> => {
      await connection()
      return unwrapDataState(
        await dependencies.getPageTexts.call({ page }),
      )
    },
  )

  return { loadPageTexts }
}
