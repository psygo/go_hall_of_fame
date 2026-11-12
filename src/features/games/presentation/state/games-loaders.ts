import { notFound } from "next/navigation"
import { connection } from "next/server"
import { cache } from "react"

import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type {
  Game,
  GameProfile,
} from "../../domain/entities/game"
import type { GetGameProfileParams } from "../../domain/params/get-game-profile-params"

export type GamesLoaderDependencies = {
  readonly listGames: UseCase<
    NoParams,
    DataState<readonly Game[]>
  >
  readonly getGameProfile: UseCase<
    GetGameProfileParams,
    DataState<GameProfile | null>
  >
}

export function createGamesLoaders(
  dependencies: GamesLoaderDependencies,
) {
  async function loadGames(): Promise<readonly Game[]> {
    await connection()
    return unwrapDataState(
      await dependencies.listGames.call({}),
    )
  }

  const loadGameProfile = cache(
    async (slug: string): Promise<GameProfile> => {
      await connection()
      const profile = unwrapDataState(
        await dependencies.getGameProfile.call({ slug }),
      )
      if (profile === null) notFound()
      return profile
    },
  )

  return { loadGames, loadGameProfile }
}
