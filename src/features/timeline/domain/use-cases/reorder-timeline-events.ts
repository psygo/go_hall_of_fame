import { fail, type DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { ReorderTimelineEventsParams } from "../params/reorder-timeline-events-params"
import type { TimelineRepository } from "../repositories/timeline-repository"

/** More events than the timeline will ever hold: a bigger list is not an order, it is abuse. */
export const MAX_REORDERED_EVENTS = 1000

export class ReorderTimelineEvents implements UseCase<
  ReorderTimelineEventsParams,
  DataState<void>
> {
  constructor(
    private readonly timeline: TimelineRepository,
  ) {}

  async call({ ids }: ReorderTimelineEventsParams) {
    if (!isValidOrder(ids)) {
      return fail(new Error("Not a valid timeline order"))
    }
    const existing = await this.timeline.listAll()
    if (existing.status === "failure") return existing
    const known = new Set(existing.data.map(({ id }) => id))
    if (
      ids.length !== known.size ||
      !ids.every((id) => known.has(id))
    ) {
      return fail(
        new Error("The order must list every event once"),
      )
    }
    return this.timeline.reorder(ids)
  }
}

function isValidOrder(ids: readonly number[]): boolean {
  return (
    ids.length <= MAX_REORDERED_EVENTS &&
    ids.every(Number.isInteger) &&
    new Set(ids).size === ids.length
  )
}
