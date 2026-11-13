import type { DataState } from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { TimelineContributorReference } from "../entities/timeline-event"
import type { TimelineRepository } from "../repositories/timeline-repository"

export class ListTimelineContributorOptions implements UseCase<
  NoParams,
  DataState<readonly TimelineContributorReference[]>
> {
  constructor(
    private readonly timeline: TimelineRepository,
  ) {}

  call() {
    return this.timeline.listContributorOptions()
  }
}
