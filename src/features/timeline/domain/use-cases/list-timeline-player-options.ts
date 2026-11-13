import type { DataState } from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { TimelinePlayerReference } from "../entities/timeline-event"
import type { TimelineRepository } from "../repositories/timeline-repository"

export class ListTimelinePlayerOptions implements UseCase<
  NoParams,
  DataState<readonly TimelinePlayerReference[]>
> {
  constructor(
    private readonly timeline: TimelineRepository,
  ) {}

  call() {
    return this.timeline.listPlayerOptions()
  }
}
