import {
  collectErrors,
  type FieldErrors,
  type Validation,
} from "@/core/validation"

import type { TimelineGameReference } from "./timeline-event"

export type TimelineEventForm = {
  readonly year: string
  readonly title: string
  readonly text: string
  /** The slug of the game the event links to, or "" for none. */
  readonly gameSlug: string
}

export type TimelineEventDraft = {
  readonly year: string
  readonly title: string
  readonly text: string
  readonly gameSlug: string | null
}

export type TimelineEventErrors = FieldErrors

export const TIMELINE_LIMITS = {
  year: 40,
  title: 120,
  text: 600,
} as const

export function validateTimelineEventForm(
  form: TimelineEventForm,
  gameOptions: readonly TimelineGameReference[],
): Validation<TimelineEventDraft, TimelineEventErrors> {
  const year = form.year.trim()
  const title = form.title.trim()
  const text = form.text.trim()
  const gameSlug = form.gameSlug.trim()
  const errors = collectErrors({
    year: requiredError(
      year,
      TIMELINE_LIMITS.year,
      "a year or period",
    ),
    title: requiredError(
      title,
      TIMELINE_LIMITS.title,
      "a title",
    ),
    text: requiredError(
      text,
      TIMELINE_LIMITS.text,
      "a description",
    ),
    gameSlug:
      gameSlug === "" ||
      gameOptions.some((game) => game.slug === gameSlug)
        ? undefined
        : "Choose a game that is in the Hall.",
  })
  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }
  return {
    valid: true,
    draft: {
      year,
      title,
      text,
      gameSlug: gameSlug || null,
    },
  }
}

function requiredError(
  value: string,
  maxLength: number,
  what: string,
): string | undefined {
  if (value === "") return `Enter ${what}.`
  return value.length > maxLength
    ? `Use at most ${maxLength} characters.`
    : undefined
}
