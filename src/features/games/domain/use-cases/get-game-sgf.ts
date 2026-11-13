import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { GameSlugParams } from "../params/game-slug-params"
import type { GamesRepository } from "../repositories/games-repository"

/** The text of the SGF uploaded for a game, or null. */
export class GetGameSgf implements UseCase<
  GameSlugParams,
  DataState<string | null>
> {
  constructor(private readonly games: GamesRepository) {}

  call({ slug }: GameSlugParams) {
    return this.games.findSgfTextBySlug(slug)
  }
}
