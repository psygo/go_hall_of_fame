import { notFound } from "next/navigation"
import { connection } from "next/server"
import { cache } from "react"

import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import {
  COUNTRIES,
  isCountry,
  type Country,
  type Player,
  type PlayerProfile,
} from "../../domain/entities/player"
import type { GetPlayerProfileParams } from "../../domain/params/get-player-profile-params"
import type { ListPlayersParams } from "../../domain/params/list-players-params"

export type PlayersLoaderDependencies = {
  readonly listPlayers: UseCase<
    ListPlayersParams,
    DataState<readonly Player[]>
  >
  readonly getPlayerProfile: UseCase<
    GetPlayerProfileParams,
    DataState<PlayerProfile | null>
  >
}

export type PlayersPageState = {
  readonly players: readonly Player[]
  readonly country: Country | null
  readonly countries: readonly Country[]
}

export function createPlayersLoaders(
  dependencies: PlayersLoaderDependencies,
) {
  async function loadPlayersPage(
    countryParam: string | readonly string[] | undefined,
  ): Promise<PlayersPageState> {
    await connection()
    const country = isCountry(countryParam)
      ? countryParam
      : null
    const players = unwrapDataState(
      await dependencies.listPlayers.call({ country }),
    )
    return { players, country, countries: COUNTRIES }
  }

  const loadPlayerProfile = cache(
    async (slug: string): Promise<PlayerProfile> => {
      await connection()
      const profile = unwrapDataState(
        await dependencies.getPlayerProfile.call({ slug }),
      )
      if (profile === null) notFound()
      return profile
    },
  )

  return { loadPlayersPage, loadPlayerProfile }
}
