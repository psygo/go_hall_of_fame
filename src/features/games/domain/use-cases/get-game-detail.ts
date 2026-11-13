import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { GameDetail } from "../entities/game"
import type { GameSlugParams } from "../params/game-slug-params"
import type { GamesRepository } from "../repositories/games-repository"

export class GetGameDetail implements UseCase<
  GameSlugParams,
  DataState<GameDetail | null>
> {
  constructor(private readonly games: GamesRepository) {}

  call({ slug }: GameSlugParams) {
    return this.games.findDetailBySlug(slug)
  }
}
