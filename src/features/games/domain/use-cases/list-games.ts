import type { DataState } from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { Game } from "../entities/game"
import type { GamesRepository } from "../repositories/games-repository"

export class ListGames implements UseCase<
  NoParams,
  DataState<readonly Game[]>
> {
  constructor(private readonly games: GamesRepository) {}

  call() {
    return this.games.listAll()
  }
}
