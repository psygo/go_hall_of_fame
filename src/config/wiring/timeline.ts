import "server-only"

import { TimelineDataSource } from "@/features/timeline/data/data-sources/timeline-data-source"
import { TimelineRepositoryImpl } from "@/features/timeline/data/repositories/timeline-repository-impl"
import { DeleteTimelineEvent } from "@/features/timeline/domain/use-cases/delete-timeline-event"
import { GetTimelineEvent } from "@/features/timeline/domain/use-cases/get-timeline-event"
import { ListTimelineChunk } from "@/features/timeline/domain/use-cases/list-timeline-chunk"
import { ListTimelineContributorOptions } from "@/features/timeline/domain/use-cases/list-timeline-contributor-options"
import { ListTimelineGameOptions } from "@/features/timeline/domain/use-cases/list-timeline-game-options"
import { ListTimelinePlayerOptions } from "@/features/timeline/domain/use-cases/list-timeline-player-options"
import { ListTimelineEvents } from "@/features/timeline/domain/use-cases/list-timeline-events"
import { ReorderTimelineEvents } from "@/features/timeline/domain/use-cases/reorder-timeline-events"
import { SaveTimelineEvent } from "@/features/timeline/domain/use-cases/save-timeline-event"
import { createTimelineAdminState } from "@/features/timeline/presentation/state/timeline-admin-state"
import { createTimelineLoaders } from "@/features/timeline/presentation/state/timeline-loaders"

import { canSeeDrafts, requireAdmin } from "./auth"
import { database } from "./infrastructure"

const repository = new TimelineRepositoryImpl(
  new TimelineDataSource(database),
  canSeeDrafts,
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
  listGameOptions: new ListTimelineGameOptions(repository),
  listPlayerOptions: new ListTimelinePlayerOptions(
    repository,
  ),
  listContributorOptions:
    new ListTimelineContributorOptions(repository),
  saveTimelineEvent: new SaveTimelineEvent(repository),
  reorderTimelineEvents: new ReorderTimelineEvents(
    repository,
  ),
  deleteTimelineEvent: new DeleteTimelineEvent(repository),
})
