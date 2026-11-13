import type { GameForm } from "../entities/game-draft"

export type SaveGameParams = {
  /** Null creates a new game. */
  readonly originalSlug: string | null
  readonly form: GameForm
}
