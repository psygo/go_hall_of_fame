import "server-only"

import { TimelineDataSource } from "@/features/timeline/data/data-sources/timeline-data-source"
import { TimelineRepositoryImpl } from "@/features/timeline/data/repositories/timeline-repository-impl"
import { ListTimelineEvents } from "@/features/timeline/domain/use-cases/list-timeline-events"
import { createTimelineLoaders } from "@/features/timeline/presentation/state/timeline-loaders"

import { database } from "./infrastructure"

export const timelineLoaders = createTimelineLoaders({
  listTimelineEvents: new ListTimelineEvents(
    new TimelineRepositoryImpl(
      new TimelineDataSource(database),
    ),
  ),
})
