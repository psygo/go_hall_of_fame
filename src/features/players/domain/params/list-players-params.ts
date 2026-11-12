import type { Country } from "../entities/player"

export type ListPlayersParams = {
  /** Null lists every country. */
  readonly country: Country | null
}
