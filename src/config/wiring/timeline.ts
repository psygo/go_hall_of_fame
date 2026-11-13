import "server-only"

import { TimelineDataSource } from "@/features/timeline/data/data-sources/timeline-data-source"
import { TimelineRepositoryImpl } from "@/features/timeline/data/repositories/timeline-repository-impl"
import { DeleteTimelineEvent } from "@/features/timeline/domain/use-cases/delete-timeline-event"
import { GetTimelineEvent } from "@/features/timeline/domain/use-cases/get-timeline-event"
import { ListTimelineChunk } from "@/features/timeline/domain/use-cases/list-timeline-chunk"
import { ListTimelineEvents } from "@/features/timeline/domain/use-cases/list-timeline-events"
import { SaveTimelineEvent } from "@/features/timeline/domain/use-cases/save-timeline-event"
import { createTimelineAdminState } from "@/features/timeline/presentation/state/timeline-admin-state"
import { createTimelineLoaders } from "@/features/timeline/presentation/state/timeline-loaders"

import { requireAdmin } from "./auth"
import { database } from "./infrastructure"

const repository = new TimelineRepositoryImpl(
  new TimelineDataSource(database),
)
const listTimelineEvents = new ListTimelineEvents(
  repository,
)

export const timelineLoaders = createTimelineLoaders({
  listTimelineChunk: new ListTimelineChunk(repository),
})

export const timelineAdminState = createTimelineAdminState({
  requireAdmin,
  listTimelineEvents,
  getTimelineEvent: new GetTimelineEvent(repository),
  saveTimelineEvent: new SaveTimelineEvent(repository),
  deleteTimelineEvent: new DeleteTimelineEvent(repository),
})
