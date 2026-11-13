import type { TimelineEvent } from "./timeline-event"

/** Events this close together share a side of the timeline instead of alternating. */
export const CLUSTER_WITHIN_YEARS = 5

export type TimelineSide = "left" | "right"

export type TimelinePlacement = {
  readonly event: TimelineEvent
  readonly side: TimelineSide
  /** Position in the whole timeline (not the chunk), which alternates the stone colour. */
  readonly index: number
  /** True when the event sits under the previous one, on the same side. */
  readonly isClustered: boolean
}

/**
 * Places the events (already sorted by year) on a two-sided timeline: they alternate sides,
 * except that an event within CLUSTER_WITHIN_YEARS of the previous one stays on its side.
 */
export function layoutTimeline(
  events: readonly TimelineEvent[],
): readonly TimelinePlacement[] {
  return events.reduce<readonly TimelinePlacement[]>(
    (placements, event, index) => {
      if (index === 0) {
        return [
          {
            event,
            side: "left",
            isClustered: false,
            index,
          },
        ]
      }
      const previous = placements[index - 1]
      const isClustered =
        Math.abs(event.year - previous.event.year) <=
        CLUSTER_WITHIN_YEARS
      const side = isClustered
        ? previous.side
        : oppositeOf(previous.side)
      return [
        ...placements,
        { event, side, isClustered, index },
      ]
    },
    [],
  )
}

function oppositeOf(side: TimelineSide): TimelineSide {
  return side === "left" ? "right" : "left"
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
  eventsByYear: readonly TimelineEvent[],
  order: TimelineOrder,
): readonly TimelinePlacement[] {
  return layoutTimeline(
    order === "newest"
      ? [...eventsByYear].reverse()
      : eventsByYear,
  )
}
