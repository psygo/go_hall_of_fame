import "server-only"

import { FeedbackDataSource } from "@/features/about/data/data-sources/feedback-data-source"
import { FeedbackRepositoryImpl } from "@/features/about/data/repositories/feedback-repository-impl"
import { DeleteFeedback } from "@/features/about/domain/use-cases/delete-feedback"
import { ListFeedback } from "@/features/about/domain/use-cases/list-feedback"
import { SetFeedbackRead } from "@/features/about/domain/use-cases/set-feedback-read"
import { SubmitFeedback } from "@/features/about/domain/use-cases/submit-feedback"
import { createFeedbackAdminState } from "@/features/about/presentation/state/feedback-admin-state"
import { createFeedbackState } from "@/features/about/presentation/state/feedback-state"

import { requireAdmin } from "./auth"
import { database } from "./infrastructure"

const feedback = new FeedbackRepositoryImpl(
  new FeedbackDataSource(database),
)

export const feedbackState = createFeedbackState({
  submitFeedback: new SubmitFeedback(feedback),
})

export const feedbackAdminState = createFeedbackAdminState({
  requireAdmin,
  listFeedback: new ListFeedback(feedback),
  setFeedbackRead: new SetFeedbackRead(feedback),
  deleteFeedback: new DeleteFeedback(feedback),
})
