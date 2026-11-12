import type { DataState } from "@/core/data-state"

import type { NominationDraft } from "../entities/nomination"

export interface NominationsRepository {
  submit(draft: NominationDraft): Promise<DataState<void>>
}
