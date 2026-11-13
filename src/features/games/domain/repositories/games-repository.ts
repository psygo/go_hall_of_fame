import type { DataState } from "@/core/data-state"

import type {
  Game,
  GameDetail,
  GamePlayerReference,
} from "../entities/game"
import type { GameDraft } from "../entities/game-draft"

export interface GamesRepository {
  listAll(): Promise<DataState<readonly Game[]>>
  findDetailBySlug(
    slug: string,
  ): Promise<DataState<GameDetail | null>>
  /** The text of the uploaded SGF, or null when the game has none (or does not exist). */
  findSgfTextBySlug(
    slug: string,
  ): Promise<DataState<string | null>>
  /** Every player in the Hall, to choose from when saying who played a game. */
  listPlayerOptions(): Promise<
    DataState<readonly GamePlayerReference[]>
  >
  /**
   * Updates the game with `originalSlug`, or inserts a new one when it is null, and replaces the
   * players linked to it.
   */
  save(
    draft: GameDraft,
    originalSlug: string | null,
  ): Promise<DataState<void>>
  deleteBySlug(slug: string): Promise<DataState<void>>
}
