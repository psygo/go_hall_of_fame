import type { DataState } from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { TimelineEvent } from "../entities/timeline-event"
import type { TimelineRepository } from "../repositories/timeline-repository"

export class ListTimelineEvents implements UseCase<
  NoParams,
  DataState<readonly TimelineEvent[]>
> {
  constructor(
    private readonly timeline: TimelineRepository,
  ) {}

  call() {
    return this.timeline.listAll()
  }
}
