import type { DataState } from "@/core/data-state"

import type { TimelineEvent } from "../entities/timeline-event"

export interface TimelineRepository {
  listAll(): Promise<DataState<readonly TimelineEvent[]>>
}
