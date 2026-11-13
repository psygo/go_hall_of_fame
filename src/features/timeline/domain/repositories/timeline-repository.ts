import type { DataState } from "@/core/data-state"

import type { TimelineEvent } from "../entities/timeline-event"
import type { TimelineEventDraft } from "../entities/timeline-event-draft"

export interface TimelineRepository {
  listAll(): Promise<DataState<readonly TimelineEvent[]>>
  findById(
    id: number,
  ): Promise<DataState<TimelineEvent | null>>
  /** Updates the event with `id`, or inserts a new one when `id` is null. */
  save(
    draft: TimelineEventDraft,
    id: number | null,
  ): Promise<DataState<void>>
  delete(id: number): Promise<DataState<void>>
}
