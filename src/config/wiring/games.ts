import "server-only"

import { GamesDataSource } from "@/features/games/data/data-sources/games-data-source"
import { GamesRepositoryImpl } from "@/features/games/data/repositories/games-repository-impl"
import { DeleteGame } from "@/features/games/domain/use-cases/delete-game"
import { GetGameDetail } from "@/features/games/domain/use-cases/get-game-detail"
import { GetGameProfile } from "@/features/games/domain/use-cases/get-game-profile"
import { ListGamePlayerOptions } from "@/features/games/domain/use-cases/list-game-player-options"
import { GetGameSgf } from "@/features/games/domain/use-cases/get-game-sgf"
import { ListGames } from "@/features/games/domain/use-cases/list-games"
import { SearchGames } from "@/features/games/domain/use-cases/search-games"
import { SaveGame } from "@/features/games/domain/use-cases/save-game"
import { createGamesAdminState } from "@/features/games/presentation/state/games-admin-state"
import { createGamesLoaders } from "@/features/games/presentation/state/games-loaders"

import { canSeeDrafts, requireAdmin } from "./auth"
import { database } from "./infrastructure"

const repository = new GamesRepositoryImpl(
  new GamesDataSource(database),
  canSeeDrafts,
)
const listGames = new ListGames(repository)

export const gamesLoaders = createGamesLoaders({
  searchGames: new SearchGames(repository),
  getGameSgf: new GetGameSgf(repository),
  getGameProfile: new GetGameProfile(repository),
})

export const gamesAdminState = createGamesAdminState({
  requireAdmin,
  listGames,
  getGameDetail: new GetGameDetail(repository),
  listGamePlayerOptions: new ListGamePlayerOptions(
    repository,
  ),
  saveGame: new SaveGame(repository),
  deleteGame: new DeleteGame(repository),
})
