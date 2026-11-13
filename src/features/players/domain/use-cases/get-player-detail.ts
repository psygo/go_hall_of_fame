import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { PlayerDetail } from "../entities/player"
import type { GetPlayerDetailParams } from "../params/get-player-detail-params"
import type { PlayersRepository } from "../repositories/players-repository"

export class GetPlayerDetail implements UseCase<
  GetPlayerDetailParams,
  DataState<PlayerDetail | null>
> {
  constructor(
    private readonly players: PlayersRepository,
  ) {}

  call({ slug }: GetPlayerDetailParams) {
    return this.players.findDetailBySlug(slug)
  }
}
