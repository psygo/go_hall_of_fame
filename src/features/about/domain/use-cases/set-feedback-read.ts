import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { SetFeedbackReadParams } from "../params/set-feedback-read-params"
import type { FeedbackRepository } from "../repositories/feedback-repository"

export class SetFeedbackRead implements UseCase<
  SetFeedbackReadParams,
  DataState<void>
> {
  constructor(
    private readonly feedback: FeedbackRepository,
  ) {}

  call({ id, isRead }: SetFeedbackReadParams) {
    return this.feedback.setRead(id, isRead)
  }
}
