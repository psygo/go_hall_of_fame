import type {
  Country,
  PlayerSort,
} from "../entities/player"

export type SearchPlayersParams = {
  /** Null lists every country. */
  readonly country: Country | null
  /** Words to look for; empty matches everyone. */
  readonly query: string
  readonly sort: PlayerSort
  /** 1-based; clamped into the pages that exist. */
  readonly page: number
}
