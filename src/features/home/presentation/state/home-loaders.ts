import { connection } from "next/server"

import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { HomeSummary } from "../../domain/entities/home-summary"

export type HomeLoaderDependencies = {
  readonly getHomeSummary: UseCase<
    NoParams,
    DataState<HomeSummary>
  >
}

export function createHomeLoaders(
  dependencies: HomeLoaderDependencies,
) {
  async function loadHome(): Promise<HomeSummary> {
    await connection()
    return unwrapDataState(
      await dependencies.getHomeSummary.call({}),
    )
  }

  return { loadHome }
}
