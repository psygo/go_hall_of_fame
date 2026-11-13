import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { TimelineEvent } from "../entities/timeline-event"
import type { TimelineEventIdParams } from "../params/timeline-event-id-params"
import type { TimelineRepository } from "../repositories/timeline-repository"

export class GetTimelineEvent implements UseCase<
  TimelineEventIdParams,
  DataState<TimelineEvent | null>
> {
  constructor(
    private readonly timeline: TimelineRepository,
  ) {}

  call({ id }: TimelineEventIdParams) {
    return this.timeline.findById(id)
  }
}
