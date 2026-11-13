import type { DataState } from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { FeedbackRecord } from "../entities/feedback-record"
import type { FeedbackRepository } from "../repositories/feedback-repository"

export class ListFeedback implements UseCase<
  NoParams,
  DataState<readonly FeedbackRecord[]>
> {
  constructor(
    private readonly feedback: FeedbackRepository,
  ) {}

  call() {
    return this.feedback.listAll()
  }
}
