import type { TimelineEvent } from "./timeline-event"

export type TimelineSide = "left" | "right"

export type TimelinePlacement = {
  readonly event: TimelineEvent
  readonly side: TimelineSide
  /** Position in the whole timeline (not the chunk), which alternates the stone colour. */
  readonly index: number
}

/** Places the events (already in timeline order) on a two-sided timeline: they alternate sides. */
export function layoutTimeline(
  events: readonly TimelineEvent[],
): readonly TimelinePlacement[] {
  return events.map((event, index) => ({
    event,
    side: index % 2 === 0 ? "left" : "right",
    index,
  }))
}

export const TIMELINE_CHUNK_SIZE = 6

export const TIMELINE_ORDERS = ["oldest", "newest"] as const

export type TimelineOrder = (typeof TIMELINE_ORDERS)[number]

export const TIMELINE_ORDER_LABELS: Readonly<
  Record<TimelineOrder, string>
> = {
  oldest: "Oldest first",
  newest: "Newest first",
}

/** Lays the whole timeline out in the chosen order, so every chunk keeps its sides. */
export function placeTimeline(
  eventsInOrder: readonly TimelineEvent[],
  order: TimelineOrder,
): readonly TimelinePlacement[] {
  return layoutTimeline(
    order === "newest"
      ? [...eventsInOrder].reverse()
      : eventsInOrder,
  )
}
