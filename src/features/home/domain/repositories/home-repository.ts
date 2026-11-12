import type { DataState } from "@/core/data-state"

import type { HomeFacts } from "../entities/home-summary"

export interface HomeRepository {
  getFacts(): Promise<DataState<HomeFacts>>
}
