import type { SaveResult } from "@/core/validation"
import type { UseCase } from "@/core/use-case"

import {
  validateTimelineEventForm,
  type TimelineEventErrors,
} from "../entities/timeline-event-draft"
import type { SaveTimelineEventParams } from "../params/save-timeline-event-params"
import type { TimelineRepository } from "../repositories/timeline-repository"

export class SaveTimelineEvent implements UseCase<
  SaveTimelineEventParams,
  SaveResult<TimelineEventErrors>
> {
  constructor(
    private readonly timeline: TimelineRepository,
  ) {}

  async call({
    id,
    form,
  }: SaveTimelineEventParams): Promise<
    SaveResult<TimelineEventErrors>
  > {
    const validation = validateTimelineEventForm(form)
    if (!validation.valid) {
      return {
        status: "invalid",
        errors: validation.errors,
      }
    }
    const saved = await this.timeline.save(
      validation.draft,
      id,
    )
    return saved.status === "failure"
      ? { status: "failed", error: saved.error }
      : { status: "saved" }
  }
}
