import type { TimelineOrder } from "../entities/timeline-layout"

export type ListTimelineChunkParams = {
  readonly order: TimelineOrder
  /** How many placements were already read. */
  readonly offset: number
}
