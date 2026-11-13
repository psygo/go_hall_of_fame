import type { DataState } from "@/core/data-state"

import type {
  TimelineEvent,
  TimelineGameReference,
  TimelinePlayerReference,
} from "../entities/timeline-event"
import type { TimelineEventDraft } from "../entities/timeline-event-draft"

export interface TimelineRepository {
  listAll(): Promise<DataState<readonly TimelineEvent[]>>
  findById(
    id: number,
  ): Promise<DataState<TimelineEvent | null>>
  /** Every game in the Hall, to choose from when an event points at one. */
  listGameOptions(): Promise<
    DataState<readonly TimelineGameReference[]>
  >
  /** Every player in the Hall, to choose from when an event points at one. */
  listPlayerOptions(): Promise<
    DataState<readonly TimelinePlayerReference[]>
  >
  /** Updates the event with `id`, or inserts a new one when `id` is null. */
  save(
    draft: TimelineEventDraft,
    id: number | null,
  ): Promise<DataState<void>>
  /** Gives the events the positions of `ids`: the first id shows first. */
  reorder(ids: readonly number[]): Promise<DataState<void>>
  delete(id: number): Promise<DataState<void>>
}
