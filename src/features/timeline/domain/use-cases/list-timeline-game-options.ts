import type { DataState } from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { TimelineGameReference } from "../entities/timeline-event"
import type { TimelineRepository } from "../repositories/timeline-repository"

export class ListTimelineGameOptions implements UseCase<
  NoParams,
  DataState<readonly TimelineGameReference[]>
> {
  constructor(
    private readonly timeline: TimelineRepository,
  ) {}

  call() {
    return this.timeline.listGameOptions()
  }
}
