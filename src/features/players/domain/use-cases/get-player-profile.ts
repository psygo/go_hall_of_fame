import {
  fail,
  succeed,
  type DataState,
} from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import {
  findNeighborsOfPlayer,
  type PlayerDetail,
  type PlayerProfile,
} from "../entities/player"
import type { GetPlayerProfileParams } from "../params/get-player-profile-params"
import type { PlayersRepository } from "../repositories/players-repository"

export class GetPlayerProfile implements UseCase<
  GetPlayerProfileParams,
  DataState<PlayerProfile | null>
> {
  constructor(
    private readonly players: PlayersRepository,
  ) {}

  async call({ slug }: GetPlayerProfileParams) {
    const detail = await this.players.findDetailBySlug(slug)
    if (detail.status === "failure") return detail
    if (detail.data === null) return succeed(null)
    return this.withNeighbors(detail.data)
  }

  private async withNeighbors(
    detail: PlayerDetail,
  ): Promise<DataState<PlayerProfile>> {
    const all = await this.players.listAll()
    if (all.status === "failure") return all
    const neighbors = findNeighborsOfPlayer(
      all.data,
      detail.slug,
    )
    if (neighbors === null) {
      return fail(
        `Player ${detail.slug} is missing from the list`,
      )
    }
    return succeed({ detail, ...neighbors })
  }
}
