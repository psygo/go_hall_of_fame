import { succeed, type DataState } from "@/core/data-state"
import { paginate, type Page } from "@/core/list-query"
import type { UseCase } from "@/core/use-case"

import {
  filterPlayersByCountry,
  PLAYERS_PAGE_SIZE,
  searchPlayers,
  sortPlayers,
  type Player,
} from "../entities/player"
import type { SearchPlayersParams } from "../params/search-players-params"
import type { PlayersRepository } from "../repositories/players-repository"

export class SearchPlayers implements UseCase<
  SearchPlayersParams,
  DataState<Page<Player>>
> {
  constructor(
    private readonly players: PlayersRepository,
  ) {}

  async call({
    country,
    query,
    sort,
    page,
  }: SearchPlayersParams) {
    const all = await this.players.listAll()
    if (all.status === "failure") return all
    const found = sortPlayers(
      searchPlayers(
        filterPlayersByCountry(all.data, country),
        query,
      ),
      sort,
    )
    return succeed(paginate(found, page, PLAYERS_PAGE_SIZE))
  }
}
