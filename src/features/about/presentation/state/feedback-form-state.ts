import type {
  FeedbackDraft,
  FeedbackErrors,
} from "../../domain/entities/feedback"

export type FeedbackFormState =
  | { readonly status: "idle" }
  | {
      readonly status: "invalid"
      readonly errors: FeedbackErrors
      readonly values: FeedbackDraft
    }
  | {
      readonly status: "failed"
      readonly values: FeedbackDraft
    }
  | { readonly status: "accepted" }

export const idleFeedbackForm: FeedbackFormState = {
  status: "idle",
}
