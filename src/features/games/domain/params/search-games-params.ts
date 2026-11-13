import type { GameSort } from "../entities/game"

export type SearchGamesParams = {
  /** Words to look for; empty lists every game. */
  readonly query: string
  readonly sort: GameSort
  /** 1-based; clamped into the pages that exist. */
  readonly page: number
}
