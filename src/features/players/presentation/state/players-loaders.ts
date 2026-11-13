import { notFound } from "next/navigation"
import { connection } from "next/server"
import { cache } from "react"

import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import {
  readChoice,
  readPageParam,
  readParam,
  readSearchParam,
  type Page,
  type QueryParam,
} from "@/core/list-query"
import type { UseCase } from "@/core/use-case"

import {
  COUNTRIES,
  DEFAULT_PLAYER_SORT,
  isCountry,
  PLAYER_SORTS,
  type Country,
  type Player,
  type PlayerProfile,
  type PlayerSort,
} from "../../domain/entities/player"
import type { GetPlayerProfileParams } from "../../domain/params/get-player-profile-params"
import type { SearchPlayersParams } from "../../domain/params/search-players-params"

export type PlayersLoaderDependencies = {
  readonly searchPlayers: UseCase<
    SearchPlayersParams,
    DataState<Page<Player>>
  >
  readonly getPlayerProfile: UseCase<
    GetPlayerProfileParams,
    DataState<PlayerProfile | null>
  >
}

export type PlayersSearchParams = {
  readonly country?: QueryParam
  readonly q?: QueryParam
  readonly sort?: QueryParam
  readonly page?: QueryParam
}

export type PlayersPageState = {
  readonly players: Page<Player>
  readonly country: Country | null
  readonly countries: readonly Country[]
  readonly query: string
  readonly sort: PlayerSort
}

export function createPlayersLoaders(
  dependencies: PlayersLoaderDependencies,
) {
  async function loadPlayersPage(
    params: PlayersSearchParams,
  ): Promise<PlayersPageState> {
    await connection()
    const countryParam = readParam(params.country)
    const country = isCountry(countryParam)
      ? countryParam
      : null
    const query = readSearchParam(params.q)
    const sort = readChoice(
      params.sort,
      PLAYER_SORTS,
      DEFAULT_PLAYER_SORT,
    )
    const players = unwrapDataState(
      await dependencies.searchPlayers.call({
        country,
        query,
        sort,
        page: readPageParam(params.page),
      }),
    )
    return {
      players,
      country,
      countries: COUNTRIES,
      query,
      sort,
    }
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
