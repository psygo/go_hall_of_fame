import type { DataState } from "@/core/data-state"

import type { FeedbackDraft } from "../entities/feedback"
import type { FeedbackRecord } from "../entities/feedback-record"

export interface FeedbackRepository {
  submit(draft: FeedbackDraft): Promise<DataState<void>>
  /** Newest first. */
  listAll(): Promise<DataState<readonly FeedbackRecord[]>>
  setRead(
    id: number,
    isRead: boolean,
  ): Promise<DataState<void>>
  delete(id: number): Promise<DataState<void>>
}
