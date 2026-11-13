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
  readSearchParam,
  type Page,
  type QueryParam,
} from "@/core/list-query"
import type { UseCase } from "@/core/use-case"

import {
  GAME_SORTS,
  type Game,
  type GameProfile,
  type GameSort,
} from "../../domain/entities/game"
import type { GameSlugParams } from "../../domain/params/game-slug-params"
import type { SearchGamesParams } from "../../domain/params/search-games-params"
import type { GetGameProfileParams } from "../../domain/params/get-game-profile-params"

export type GamesLoaderDependencies = {
  readonly searchGames: UseCase<
    SearchGamesParams,
    DataState<Page<Game>>
  >
  readonly getGameSgf: UseCase<
    GameSlugParams,
    DataState<string | null>
  >
  readonly getGameProfile: UseCase<
    GetGameProfileParams,
    DataState<GameProfile | null>
  >
}

export type GamesSearchParams = {
  readonly q?: QueryParam
  readonly sort?: QueryParam
  readonly page?: QueryParam
}

export type GamesPageState = {
  readonly games: Page<Game>
  readonly query: string
  readonly sort: GameSort
}

export function createGamesLoaders(
  dependencies: GamesLoaderDependencies,
) {
  async function loadGamesPage(
    params: GamesSearchParams,
  ): Promise<GamesPageState> {
    await connection()
    const query = readSearchParam(params.q)
    const sort = readChoice(
      params.sort,
      GAME_SORTS,
      "oldest",
    )
    const games = unwrapDataState(
      await dependencies.searchGames.call({
        query,
        sort,
        page: readPageParam(params.page),
      }),
    )
    return { games, query, sort }
  }

  /** The uploaded SGF of a game, or null when there is none. */
  async function loadGameSgf(
    slug: string,
  ): Promise<string | null> {
    await connection()
    return unwrapDataState(
      await dependencies.getGameSgf.call({ slug }),
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

  return { loadGamesPage, loadGameSgf, loadGameProfile }
}
