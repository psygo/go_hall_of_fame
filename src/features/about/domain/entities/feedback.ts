/** What a visitor sends from the About page. */
export type FeedbackDraft = {
  readonly email: string
  readonly description: string
}

export type FeedbackErrors = {
  readonly email?: string
  readonly description?: string
}

export type FeedbackSubmission =
  | { readonly status: "accepted" }
  | {
      readonly status: "invalid"
      readonly errors: FeedbackErrors
    }
  | { readonly status: "failed"; readonly error: Error }

/** Lengths are checked before any pattern, so a huge input is rejected cheaply. */
export const FEEDBACK_LIMITS = {
  email: 254,
  description: 3000,
} as const

// Every class excludes the separator that follows it, so matching is linear.
// Plain address characters only: the admin opens it as a mailto: link, so no ? & % / # or quotes.
const EMAIL_PATTERN =
  /^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/

export function normalizeFeedbackDraft(
  draft: FeedbackDraft,
): FeedbackDraft {
  return {
    email: draft.email.trim(),
    description: draft.description.trim(),
  }
}

function emailError(email: string): string | undefined {
  const isValid =
    email.length <= FEEDBACK_LIMITS.email &&
    EMAIL_PATTERN.test(email)
  return isValid
    ? undefined
    : "Enter a valid email address."
}

function descriptionError(
  description: string,
): string | undefined {
  if (description === "") return "Write your feedback."
  return description.length > FEEDBACK_LIMITS.description
    ? `Use at most ${FEEDBACK_LIMITS.description} characters.`
    : undefined
}

export function validateFeedbackDraft(
  draft: FeedbackDraft,
): FeedbackErrors {
  const checks = {
    email: emailError(draft.email),
    description: descriptionError(draft.description),
  }
  return Object.fromEntries(
    Object.entries(checks).filter(
      ([, message]) => message !== undefined,
    ),
  )
}

export function hasFeedbackErrors(
  errors: FeedbackErrors,
): boolean {
  return Object.keys(errors).length > 0
}
