import type { DataState } from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { GamePlayerReference } from "../entities/game"
import type { GamesRepository } from "../repositories/games-repository"

export class ListGamePlayerOptions implements UseCase<
  NoParams,
  DataState<readonly GamePlayerReference[]>
> {
  constructor(private readonly games: GamesRepository) {}

  call() {
    return this.games.listPlayerOptions()
  }
}
