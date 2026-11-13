import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { GameSlugParams } from "../params/game-slug-params"
import type { GamesRepository } from "../repositories/games-repository"

export class DeleteGame implements UseCase<
  GameSlugParams,
  DataState<void>
> {
  constructor(private readonly games: GamesRepository) {}

  call({ slug }: GameSlugParams) {
    return this.games.deleteBySlug(slug)
  }
}
