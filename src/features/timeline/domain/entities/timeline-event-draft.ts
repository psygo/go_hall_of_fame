import {
  collectErrors,
  type FieldErrors,
  type Validation,
} from "@/core/validation"

import type {
  TimelineContributorReference,
  TimelineGameReference,
  TimelinePlayerReference,
} from "./timeline-event"

export type TimelineEventForm = {
  readonly year: string
  readonly title: string
  readonly text: string
  /** The slugs of the linked games and players, as chosen (blank rows included). */
  readonly gameSlugs: readonly string[]
  readonly playerSlugs: readonly string[]
  readonly contributorSlugs: readonly string[]
  readonly showGameTitles: boolean
  readonly isDraft: boolean
}

export type TimelineEventDraft = {
  readonly year: string
  readonly title: string
  readonly text: string
  /** Without blanks or repeats, in the chosen order. */
  readonly gameSlugs: readonly string[]
  readonly playerSlugs: readonly string[]
  readonly contributorSlugs: readonly string[]
  readonly showGameTitles: boolean
  readonly isDraft: boolean
}

export type TimelineEventErrors = FieldErrors

export const TIMELINE_LIMITS = {
  year: 40,
  title: 120,
  text: 600,
  /** Linked games, and linked players, per event. */
  maxLinks: 12,
} as const

/** What an event can be linked to: the games and the players of the Hall. */
export type TimelineLinkOptions = {
  readonly games: readonly TimelineGameReference[]
  readonly players: readonly TimelinePlayerReference[]
  readonly contributors: readonly TimelineContributorReference[]
}

export function validateTimelineEventForm(
  form: TimelineEventForm,
  options: TimelineLinkOptions,
): Validation<TimelineEventDraft, TimelineEventErrors> {
  const year = form.year.trim()
  const title = form.title.trim()
  const text = form.text.trim()
  const gameSlugs = distinctSlugs(form.gameSlugs)
  const playerSlugs = distinctSlugs(form.playerSlugs)
  const contributorSlugs = distinctSlugs(
    form.contributorSlugs,
  )
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
    gameSlugs: linkError(
      gameSlugs,
      options.games,
      "a game that is in the Hall",
    ),
    playerSlugs: linkError(
      playerSlugs,
      options.players,
      "a player who is in the Hall",
    ),
    contributorSlugs: linkError(
      contributorSlugs,
      options.contributors,
      "a contributor who is listed",
    ),
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
      gameSlugs,
      playerSlugs,
      contributorSlugs,
      showGameTitles: form.showGameTitles,
      isDraft: form.isDraft,
    },
  }
}

/** The chosen slugs without blank rows or repeats, keeping the first of each. */
function distinctSlugs(
  slugs: readonly string[],
): readonly string[] {
  return [
    ...new Set(
      slugs.map((slug) => slug.trim()).filter(Boolean),
    ),
  ]
}

function linkError(
  slugs: readonly string[],
  options: readonly { readonly slug: string }[],
  what: string,
): string | undefined {
  if (slugs.length > TIMELINE_LIMITS.maxLinks) {
    return `Link at most ${TIMELINE_LIMITS.maxLinks}.`
  }
  const known = new Set(
    options.map((option) => option.slug),
  )
  return slugs.every((slug) => known.has(slug))
    ? undefined
    : `Choose ${what}.`
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
