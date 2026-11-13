import type { TimelineEventForm } from "../entities/timeline-event-draft"

export type SaveTimelineEventParams = {
  /** Null creates a new event. */
  readonly id: number | null
  readonly form: TimelineEventForm
}
