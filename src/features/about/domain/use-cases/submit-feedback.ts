import type { UseCase } from "@/core/use-case"

import {
  hasFeedbackErrors,
  normalizeFeedbackDraft,
  validateFeedbackDraft,
  type FeedbackSubmission,
} from "../entities/feedback"
import type { SubmitFeedbackParams } from "../params/submit-feedback-params"
import type { FeedbackRepository } from "../repositories/feedback-repository"

export class SubmitFeedback implements UseCase<
  SubmitFeedbackParams,
  FeedbackSubmission
> {
  constructor(
    private readonly feedback: FeedbackRepository,
  ) {}

  async call(
    params: SubmitFeedbackParams,
  ): Promise<FeedbackSubmission> {
    const draft = normalizeFeedbackDraft(params.draft)
    const errors = validateFeedbackDraft(draft)
    if (hasFeedbackErrors(errors)) {
      return { status: "invalid", errors }
    }
    const saved = await this.feedback.submit(draft)
    return saved.status === "failure"
      ? { status: "failed", error: saved.error }
      : { status: "accepted" }
  }
}
