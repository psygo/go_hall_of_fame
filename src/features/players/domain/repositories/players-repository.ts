import type { DataState } from "@/core/data-state"

import type {
  Player,
  PlayerDetail,
} from "../entities/player"
import type { PlayerDraft } from "../entities/player-draft"

export interface PlayersRepository {
  listAll(): Promise<DataState<readonly Player[]>>
  findDetailBySlug(
    slug: string,
  ): Promise<DataState<PlayerDetail | null>>
  /**
   * Updates the player with `originalSlug`, or inserts a new one when it is null.
   */
  save(
    draft: PlayerDraft,
    originalSlug: string | null,
  ): Promise<DataState<void>>
  deleteBySlug(slug: string): Promise<DataState<void>>
}
