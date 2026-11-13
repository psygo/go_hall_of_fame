"use server"

import { feedbackState } from "@/config/di"

import type { FeedbackFormState } from "./feedback-form-state"

export async function submitFeedbackAction(
  _previous: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  return feedbackState.submitFeedbackForm(formData)
}
