import { succeed, type DataState } from "@/core/data-state"
import { paginate, type Page } from "@/core/list-query"
import type { UseCase } from "@/core/use-case"

import {
  GAMES_PAGE_SIZE,
  searchGames,
  sortGames,
  type Game,
} from "../entities/game"
import type { SearchGamesParams } from "../params/search-games-params"
import type { GamesRepository } from "../repositories/games-repository"

export class SearchGames implements UseCase<
  SearchGamesParams,
  DataState<Page<Game>>
> {
  constructor(private readonly games: GamesRepository) {}

  async call({ query, sort, page }: SearchGamesParams) {
    const all = await this.games.listAll()
    if (all.status === "failure") return all
    const found = sortGames(
      searchGames(all.data, query),
      sort,
    )
    return succeed(paginate(found, page, GAMES_PAGE_SIZE))
  }
}
