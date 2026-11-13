import type { DataState } from "@/core/data-state"

import type { NominationDraft } from "../entities/nomination"
import type {
  NominationRecord,
  NominationStatus,
} from "../entities/nomination-record"

export interface NominationsRepository {
  submit(draft: NominationDraft): Promise<DataState<void>>
  /** Newest first. */
  listAll(): Promise<DataState<readonly NominationRecord[]>>
  updateStatus(
    id: number,
    status: NominationStatus,
  ): Promise<DataState<void>>
  delete(id: number): Promise<DataState<void>>
}
