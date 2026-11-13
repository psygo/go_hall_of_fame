import "server-only"

import { HomeDataSource } from "@/features/home/data/data-sources/home-data-source"
import { HomeRepositoryImpl } from "@/features/home/data/repositories/home-repository-impl"
import { GetHomeSummary } from "@/features/home/domain/use-cases/get-home-summary"
import { createHomeLoaders } from "@/features/home/presentation/state/home-loaders"

import { canSeeDrafts } from "./auth"
import { database } from "./infrastructure"

export const homeLoaders = createHomeLoaders({
  getHomeSummary: new GetHomeSummary(
    new HomeRepositoryImpl(
      new HomeDataSource(database),
      canSeeDrafts,
    ),
  ),
})
