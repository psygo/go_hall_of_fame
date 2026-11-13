import { connection } from "next/server"

import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import {
  readChoice,
  type QueryParam,
  type Slice,
} from "@/core/list-query"
import type { UseCase } from "@/core/use-case"

import {
  TIMELINE_ORDERS,
  type TimelineOrder,
  type TimelinePlacement,
} from "../../domain/entities/timeline-layout"
import type { ListTimelineChunkParams } from "../../domain/params/list-timeline-chunk-params"

export type TimelineLoaderDependencies = {
  readonly listTimelineChunk: UseCase<
    ListTimelineChunkParams,
    DataState<Slice<TimelinePlacement>>
  >
}

export type TimelineSearchParams = {
  readonly sort?: QueryParam
}

export type TimelinePageState = {
  readonly order: TimelineOrder
  readonly first: Slice<TimelinePlacement>
}

export function createTimelineLoaders(
  dependencies: TimelineLoaderDependencies,
) {
  async function loadTimelinePage(
    params: TimelineSearchParams,
  ): Promise<TimelinePageState> {
    await connection()
    const order = readChoice(
      params.sort,
      TIMELINE_ORDERS,
      "oldest",
    )
    const first = unwrapDataState(
      await dependencies.listTimelineChunk.call({
        order,
        offset: 0,
      }),
    )
    return { order, first }
  }

  /** The chunk after `offset`, for the infinite scroll. The inputs come from the browser. */
  async function loadTimelineChunk(
    orderParam: string,
    offset: number,
  ): Promise<Slice<TimelinePlacement>> {
    await connection()
    return unwrapDataState(
      await dependencies.listTimelineChunk.call({
        order: readChoice(
          orderParam,
          TIMELINE_ORDERS,
          "oldest",
        ),
        offset: Number.isSafeInteger(offset)
          ? Math.max(0, offset)
          : 0,
      }),
    )
  }

  return { loadTimelinePage, loadTimelineChunk }
}
