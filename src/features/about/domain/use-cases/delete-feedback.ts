import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { IdParams } from "../params/id-params"
import type { FeedbackRepository } from "../repositories/feedback-repository"

export class DeleteFeedback implements UseCase<
  IdParams,
  DataState<void>
> {
  constructor(
    private readonly feedback: FeedbackRepository,
  ) {}

  call({ id }: IdParams) {
    return this.feedback.delete(id)
  }
}
