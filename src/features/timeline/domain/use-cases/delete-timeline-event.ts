import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { TimelineEventIdParams } from "../params/timeline-event-id-params"
import type { TimelineRepository } from "../repositories/timeline-repository"

export class DeleteTimelineEvent implements UseCase<
  TimelineEventIdParams,
  DataState<void>
> {
  constructor(
    private readonly timeline: TimelineRepository,
  ) {}

  call({ id }: TimelineEventIdParams) {
    return this.timeline.delete(id)
  }
}
