import type { UseCase } from "@/core/use-case"

import type { FeedbackSubmission } from "../../domain/entities/feedback"
import type { SubmitFeedbackParams } from "../../domain/params/submit-feedback-params"
import type { FeedbackFormState } from "./feedback-form-state"

export type FeedbackDependencies = {
  readonly submitFeedback: UseCase<
    SubmitFeedbackParams,
    FeedbackSubmission
  >
}

/** A hidden field that people leave empty: bots fill every field they find. */
const HONEYPOT_FIELD = "website"

export function createFeedbackState(
  dependencies: FeedbackDependencies,
) {
  async function submitFeedbackForm(
    formData: FormData,
  ): Promise<FeedbackFormState> {
    if (readText(formData, HONEYPOT_FIELD) !== "") {
      return { status: "accepted" }
    }
    const values = {
      email: readText(formData, "email"),
      description: readText(formData, "description"),
    }
    const submission =
      await dependencies.submitFeedback.call({
        draft: values,
      })
    if (submission.status === "accepted") {
      return { status: "accepted" }
    }
    if (submission.status === "invalid") {
      return {
        status: "invalid",
        errors: submission.errors,
        values,
      }
    }
    // Only the name: a driver error message can contain the submitted email.
    console.error(
      "Feedback could not be saved:",
      submission.error.name,
    )
    return { status: "failed", values }
  }

  return { submitFeedbackForm }
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}
