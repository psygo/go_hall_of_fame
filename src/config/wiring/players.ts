import "server-only"

import { PlayersDataSource } from "@/features/players/data/data-sources/players-data-source"
import { PlayersRepositoryImpl } from "@/features/players/data/repositories/players-repository-impl"
import { DeletePlayer } from "@/features/players/domain/use-cases/delete-player"
import { GetPlayerDetail } from "@/features/players/domain/use-cases/get-player-detail"
import { GetPlayerProfile } from "@/features/players/domain/use-cases/get-player-profile"
import { ListPlayers } from "@/features/players/domain/use-cases/list-players"
import { SearchPlayers } from "@/features/players/domain/use-cases/search-players"
import { SavePlayer } from "@/features/players/domain/use-cases/save-player"
import { createPlayersAdminState } from "@/features/players/presentation/state/players-admin-state"
import { createPlayersLoaders } from "@/features/players/presentation/state/players-loaders"

import { canSeeDrafts, requireAdmin } from "./auth"
import { database } from "./infrastructure"

const repository = new PlayersRepositoryImpl(
  new PlayersDataSource(database),
  canSeeDrafts,
)
const listPlayers = new ListPlayers(repository)

export const playersLoaders = createPlayersLoaders({
  searchPlayers: new SearchPlayers(repository),
  getPlayerProfile: new GetPlayerProfile(repository),
})

export const playersAdminState = createPlayersAdminState({
  requireAdmin,
  listPlayers,
  getPlayerDetail: new GetPlayerDetail(repository),
  savePlayer: new SavePlayer(repository),
  deletePlayer: new DeletePlayer(repository),
})
