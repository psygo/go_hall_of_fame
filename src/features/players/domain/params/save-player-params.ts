import type { PlayerForm } from "../entities/player-draft"

export type SavePlayerParams = {
  /** Null creates a new player. */
  readonly originalSlug: string | null
  readonly form: PlayerForm
}
