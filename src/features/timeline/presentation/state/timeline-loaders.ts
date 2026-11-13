import { connection } from "next/server"

import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { TimelineEvent } from "../../domain/entities/timeline-event"
import {
  layoutTimeline,
  type TimelinePlacement,
} from "../../domain/entities/timeline-layout"

export type TimelineLoaderDependencies = {
  readonly listTimelineEvents: UseCase<
    NoParams,
    DataState<readonly TimelineEvent[]>
  >
}

export function createTimelineLoaders(
  dependencies: TimelineLoaderDependencies,
) {
  async function loadTimeline(): Promise<
    readonly TimelinePlacement[]
  > {
    await connection()
    const events = unwrapDataState(
      await dependencies.listTimelineEvents.call({}),
    )
    return layoutTimeline(events)
  }

  return { loadTimeline }
}
