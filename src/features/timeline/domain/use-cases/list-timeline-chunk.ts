import { succeed, type DataState } from "@/core/data-state"
import { sliceFrom, type Slice } from "@/core/list-query"
import type { UseCase } from "@/core/use-case"

import {
  placeTimeline,
  TIMELINE_CHUNK_SIZE,
  type TimelinePlacement,
} from "../entities/timeline-layout"
import type { ListTimelineChunkParams } from "../params/list-timeline-chunk-params"
import type { TimelineRepository } from "../repositories/timeline-repository"

/** One chunk of the laid-out timeline, for infinite scrolling. */
export class ListTimelineChunk implements UseCase<
  ListTimelineChunkParams,
  DataState<Slice<TimelinePlacement>>
> {
  constructor(
    private readonly timeline: TimelineRepository,
  ) {}

  async call({ order, offset }: ListTimelineChunkParams) {
    const all = await this.timeline.listAll()
    if (all.status === "failure") return all
    return succeed(
      sliceFrom(
        placeTimeline(all.data, order),
        offset,
        TIMELINE_CHUNK_SIZE,
      ),
    )
  }
}
