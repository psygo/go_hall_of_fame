import { succeed, type DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import {
  filterPlayersByCountry,
  type Player,
} from "../entities/player"
import type { ListPlayersParams } from "../params/list-players-params"
import type { PlayersRepository } from "../repositories/players-repository"

export class ListPlayers implements UseCase<
  ListPlayersParams,
  DataState<readonly Player[]>
> {
  constructor(
    private readonly players: PlayersRepository,
  ) {}

  async call({ country }: ListPlayersParams) {
    const all = await this.players.listAll()
    if (all.status === "failure") return all
    return succeed(
      filterPlayersByCountry(all.data, country),
    )
  }
}
