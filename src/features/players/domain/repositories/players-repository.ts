import type { DataState } from "@/core/data-state"

import type {
  Player,
  PlayerDetail,
} from "../entities/player"

export interface PlayersRepository {
  listAll(): Promise<DataState<readonly Player[]>>
  findDetailBySlug(
    slug: string,
  ): Promise<DataState<PlayerDetail | null>>
}
