import {
  collectErrors,
  parseInteger,
  type FieldErrors,
  type Validation,
} from "@/core/validation"

import type { Criterion } from "./criterion"

export type CriterionForm = {
  readonly position: string
  readonly title: string
  readonly text: string
}

export type CriterionDraft = {
  readonly position: number
  readonly title: string
  readonly text: string
}

export type CriterionErrors = FieldErrors

export const CRITERION_LIMITS = {
  title: 60,
  text: 400,
  maxPosition: 99,
} as const

export function validateCriterionForm(
  form: CriterionForm,
  context: {
    readonly existing: readonly Criterion[]
    /** The id of the criterion being edited, or null when creating. */
    readonly editingId: number | null
  },
): Validation<CriterionDraft, CriterionErrors> {
  const position =
    form.position.trim() === ""
      ? nextPosition(context.existing)
      : parseInteger(form.position)
  const title = form.title.trim()
  const text = form.text.trim()
  const errors = collectErrors({
    position: positionError(position, context),
    title: required(
      title,
      CRITERION_LIMITS.title,
      "a title",
    ),
    text: required(
      text,
      CRITERION_LIMITS.text,
      "a description",
    ),
  })
  if (Object.keys(errors).length > 0 || position === null) {
    return { valid: false, errors }
  }
  return { valid: true, draft: { position, title, text } }
}

export function nextPosition(
  criteria: readonly Criterion[],
): number {
  return (
    criteria.reduce(
      (highest, item) => Math.max(highest, item.position),
      0,
    ) + 1
  )
}

function positionError(
  position: number | null,
  context: {
    readonly existing: readonly Criterion[]
    readonly editingId: number | null
  },
): string | undefined {
  if (
    position === null ||
    position < 1 ||
    position > CRITERION_LIMITS.maxPosition
  ) {
    return `Enter a whole number from 1 to ${CRITERION_LIMITS.maxPosition}.`
  }
  const taken = context.existing.some(
    (item) =>
      item.position === position &&
      item.id !== context.editingId,
  )
  return taken
    ? "Another criterion already has this number."
    : undefined
}

function required(
  value: string,
  maxLength: number,
  what: string,
): string | undefined {
  if (value === "") return `Enter ${what}.`
  return value.length > maxLength
    ? `Use at most ${maxLength} characters.`
    : undefined
}
