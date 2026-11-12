import type { DataState } from "@/core/data-state"

import type { Game, GameDetail } from "../entities/game"

export interface GamesRepository {
  listAll(): Promise<DataState<readonly Game[]>>
  findDetailBySlug(
    slug: string,
  ): Promise<DataState<GameDetail | null>>
}
