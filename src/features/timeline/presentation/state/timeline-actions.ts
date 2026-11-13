"use server"

import type { Slice } from "@/core/list-query"
import { timelineLoaders } from "@/config/di"

import type { TimelinePlacement } from "../../domain/entities/timeline-layout"

/** Reads the next chunk of the timeline. Public data, so no admin check. */
export async function loadTimelineChunkAction(
  order: string,
  offset: number,
): Promise<Slice<TimelinePlacement>> {
  return timelineLoaders.loadTimelineChunk(order, offset)
}
