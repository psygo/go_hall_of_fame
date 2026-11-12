import "server-only"

import { PlayersDataSource } from "@/features/players/data/data-sources/players-data-source"
import { PlayersRepositoryImpl } from "@/features/players/data/repositories/players-repository-impl"
import { GetPlayerProfile } from "@/features/players/domain/use-cases/get-player-profile"
import { ListPlayers } from "@/features/players/domain/use-cases/list-players"
import { createPlayersLoaders } from "@/features/players/presentation/state/players-loaders"

import { database } from "./infrastructure"

const repository = new PlayersRepositoryImpl(
  new PlayersDataSource(database),
)

export const playersLoaders = createPlayersLoaders({
  listPlayers: new ListPlayers(repository),
  getPlayerProfile: new GetPlayerProfile(repository),
})
