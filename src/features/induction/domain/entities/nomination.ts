export const NOMINATION_CATEGORIES = [
  "player",
  "game",
] as const

export type NominationCategory =
  (typeof NOMINATION_CATEGORIES)[number]

export type NominationDraft = {
  readonly name: string
  readonly category: NominationCategory
  readonly email: string
  readonly caseForInduction: string
}

export type NominationErrors = {
  readonly name?: string
  readonly email?: string
  readonly caseForInduction?: string
}

export type NominationSubmission =
  | {
      readonly status: "accepted"
      readonly draft: NominationDraft
    }
  | {
      readonly status: "invalid"
      readonly errors: NominationErrors
    }
  | { readonly status: "failed"; readonly error: Error }

/** Maximum lengths, checked before any pattern so a huge input is rejected cheaply. */
export const NOMINATION_LIMITS = {
  name: 200,
  email: 254,
  caseForInduction: 5000,
} as const

// Every class excludes the separator that follows it, so matching is linear. The length caps
// in validateNominationDraft still run first.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

export function isNominationCategory(
  value: unknown,
): value is NominationCategory {
  return NOMINATION_CATEGORIES.some(
    (category) => category === value,
  )
}

export function normalizeNominationDraft(
  draft: NominationDraft,
): NominationDraft {
  return {
    ...draft,
    name: draft.name.trim(),
    email: draft.email.trim(),
    caseForInduction: draft.caseForInduction.trim(),
  }
}

function nameError(name: string): string | undefined {
  if (name === "")
    return "Enter the name of the player or game."
  if (name.length > NOMINATION_LIMITS.name) {
    return `Use at most ${NOMINATION_LIMITS.name} characters.`
  }
  return undefined
}

function emailError(email: string): string | undefined {
  const isValid =
    email.length <= NOMINATION_LIMITS.email &&
    EMAIL_PATTERN.test(email)
  return isValid
    ? undefined
    : "Enter a valid email address."
}

function caseError(text: string): string | undefined {
  return text.length > NOMINATION_LIMITS.caseForInduction
    ? `Use at most ${NOMINATION_LIMITS.caseForInduction} characters.`
    : undefined
}

export function validateNominationDraft(
  draft: NominationDraft,
): NominationErrors {
  const checks = {
    name: nameError(draft.name),
    email: emailError(draft.email),
    caseForInduction: caseError(draft.caseForInduction),
  }
  return Object.fromEntries(
    Object.entries(checks).filter(
      ([, message]) => message !== undefined,
    ),
  )
}

export function hasNominationErrors(
  errors: NominationErrors,
): boolean {
  return Object.keys(errors).length > 0
}
