import {
  fail,
  succeed,
  type DataState,
} from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import {
  findNeighborsOfGame,
  type GameDetail,
  type GameProfile,
} from "../entities/game"
import type { GetGameProfileParams } from "../params/get-game-profile-params"
import type { GamesRepository } from "../repositories/games-repository"

export class GetGameProfile implements UseCase<
  GetGameProfileParams,
  DataState<GameProfile | null>
> {
  constructor(private readonly games: GamesRepository) {}

  async call({ slug }: GetGameProfileParams) {
    const detail = await this.games.findDetailBySlug(slug)
    if (detail.status === "failure") return detail
    if (detail.data === null) return succeed(null)
    return this.withNeighbors(detail.data)
  }

  private async withNeighbors(
    detail: GameDetail,
  ): Promise<DataState<GameProfile>> {
    const all = await this.games.listAll()
    if (all.status === "failure") return all
    const neighbors = findNeighborsOfGame(
      all.data,
      detail.slug,
    )
    if (neighbors === null) {
      return fail(
        `Game ${detail.slug} is missing from the list`,
      )
    }
    return succeed({ detail, ...neighbors })
  }
}
