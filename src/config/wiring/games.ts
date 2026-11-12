import "server-only"

import { GamesDataSource } from "@/features/games/data/data-sources/games-data-source"
import { GamesRepositoryImpl } from "@/features/games/data/repositories/games-repository-impl"
import { GetGameProfile } from "@/features/games/domain/use-cases/get-game-profile"
import { ListGames } from "@/features/games/domain/use-cases/list-games"
import { createGamesLoaders } from "@/features/games/presentation/state/games-loaders"

import { database } from "./infrastructure"

const repository = new GamesRepositoryImpl(
  new GamesDataSource(database),
)

export const gamesLoaders = createGamesLoaders({
  listGames: new ListGames(repository),
  getGameProfile: new GetGameProfile(repository),
})
