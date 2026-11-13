import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { GetPlayerDetailParams } from "../params/get-player-detail-params"
import type { PlayersRepository } from "../repositories/players-repository"

export class DeletePlayer implements UseCase<
  GetPlayerDetailParams,
  DataState<void>
> {
  constructor(
    private readonly players: PlayersRepository,
  ) {}

  call({ slug }: GetPlayerDetailParams) {
    return this.players.deleteBySlug(slug)
  }
}
