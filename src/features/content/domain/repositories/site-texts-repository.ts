import type { DataState } from "@/core/data-state"

import type { SiteTextChanges } from "../entities/page-text"

export interface SiteTextsRepository {
  /** The saved texts by key. Keys never saved are absent. */
  listOverrides(): Promise<
    DataState<Readonly<Record<string, string>>>
  >
  apply(changes: SiteTextChanges): Promise<DataState<void>>
}
