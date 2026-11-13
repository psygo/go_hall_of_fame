import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { ReorderTimelineEventsParams } from "../params/reorder-timeline-events-params"
import type { TimelineRepository } from "../repositories/timeline-repository"

export class ReorderTimelineEvents implements UseCase<
  ReorderTimelineEventsParams,
  DataState<void>
> {
  constructor(
    private readonly timeline: TimelineRepository,
  ) {}

  call({ ids }: ReorderTimelineEventsParams) {
    return this.timeline.reorder(ids)
  }
}
