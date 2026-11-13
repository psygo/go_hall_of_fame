import { slugify, isValidSlug } from "@/core/slugify"
import {
  validateResourceRows,
  type ResourceLink,
  type ResourceRow,
} from "@/core/resources"
import { validateTags } from "@/core/tags"
import {
  collectErrors,
  isReservedSlug,
  isSafeAssetUrl,
  parseInteger,
  type FieldErrors,
  type Validation,
} from "@/core/validation"

import {
  COUNTRIES,
  isCountry,
  type Country,
  type Player,
} from "./player"

/** What the admin form submits: every field is text, as typed. */
export type PlayerForm = {
  readonly slug: string
  readonly name: string
  readonly nativeName: string
  readonly country: string
  readonly years: string
  readonly distinction: string
  readonly bio: string
  readonly photoUrl: string
  readonly photoPosition: string
  readonly inductionNumber: string
  /** Comma-separated, optional. */
  readonly tags: string
  readonly isDraft: boolean
  readonly resources: readonly ResourceRow[]
}

export type PlayerDraft = {
  readonly slug: string
  readonly name: string
  readonly nativeName: string
  readonly country: Country
  readonly years: string
  readonly distinction: string
  readonly bio: string
  readonly photoUrl: string | null
  readonly photoPosition: string
  readonly inductionNumber: number
  readonly tags: readonly string[]
  readonly isDraft: boolean
  readonly resources: readonly ResourceLink[]
}

export type PlayerErrors = FieldErrors

export const PLAYER_LIMITS = {
  name: 120,
  nativeName: 60,
  years: 40,
  distinction: 120,
  bio: 2000,
  maxInductionNumber: 9999,
} as const

export const DEFAULT_PHOTO_POSITION = "50% 50%"
const PHOTO_POSITION_PATTERN =
  /^(?:100|\d{1,2})% (?:100|\d{1,2})%$/

export type PlayerValidationContext = {
  /** Every player now in the Hall, to check slugs and induction numbers stay unique. */
  readonly existing: readonly Player[]
  /** The slug of the player being edited, or null when creating. */
  readonly originalSlug: string | null
}

export function validatePlayerForm(
  form: PlayerForm,
  context: PlayerValidationContext,
): Validation<PlayerDraft, PlayerErrors> {
  const name = form.name.trim()
  const slug = form.slug.trim() || slugify(name)
  const others = context.existing.filter(
    (player) => player.slug !== context.originalSlug,
  )
  const inductionNumber =
    form.inductionNumber.trim() === ""
      ? blankInductionNumber(context)
      : parseInteger(form.inductionNumber)
  const photoUrl = form.photoUrl.trim()
  const photoPosition =
    form.photoPosition.trim() || DEFAULT_PHOTO_POSITION

  const resources = validateResourceRows(form.resources)
  const tags = validateTags(form.tags)

  const errors = collectErrors({
    tags: tags.valid ? undefined : tags.error,
    resources: resources.valid
      ? undefined
      : resources.error,
    name: requiredText(name, PLAYER_LIMITS.name, "a name"),
    nativeName: requiredText(
      form.nativeName.trim(),
      PLAYER_LIMITS.nativeName,
      "the name in its own script",
    ),
    slug: slugError(slug, others),
    country: isCountry(form.country)
      ? undefined
      : `Choose ${COUNTRIES.join(", ")}.`,
    years: requiredText(
      form.years.trim(),
      PLAYER_LIMITS.years,
      "the years",
    ),
    distinction: requiredText(
      form.distinction.trim(),
      PLAYER_LIMITS.distinction,
      "a distinction",
    ),
    bio: requiredText(
      form.bio.trim(),
      PLAYER_LIMITS.bio,
      "a biography",
    ),
    photoUrl:
      photoUrl === "" || isSafeAssetUrl(photoUrl)
        ? undefined
        : "Use a path such as /portraits/name.webp, or an https URL.",
    photoPosition: PHOTO_POSITION_PATTERN.test(
      photoPosition,
    )
      ? undefined
      : "Use two percentages such as 50% 20%.",
    inductionNumber: inductionNumberError(
      inductionNumber,
      others,
    ),
  })
  if (
    Object.keys(errors).length > 0 ||
    inductionNumber === null ||
    !isCountry(form.country) ||
    !resources.valid ||
    !tags.valid
  ) {
    return { valid: false, errors }
  }
  return {
    valid: true,
    draft: {
      slug,
      name,
      nativeName: form.nativeName.trim(),
      country: form.country,
      years: form.years.trim(),
      distinction: form.distinction.trim(),
      bio: form.bio.trim(),
      photoUrl: photoUrl === "" ? null : photoUrl,
      photoPosition,
      inductionNumber,
      tags: tags.tags,
      isDraft: form.isDraft,
      resources: resources.links,
    },
  }
}

export function nextInductionNumber(
  players: readonly Player[],
): number {
  return (
    players.reduce(
      (highest, player) =>
        Math.max(highest, player.inductionNumber),
      0,
    ) + 1
  )
}

function requiredText(
  value: string,
  maxLength: number,
  what: string,
): string | undefined {
  if (value === "") return `Enter ${what}.`
  return value.length > maxLength
    ? `Use at most ${maxLength} characters.`
    : undefined
}

function slugError(
  slug: string,
  others: readonly Player[],
): string | undefined {
  if (!isValidSlug(slug)) {
    return "Use lowercase letters, digits and hyphens (for example lee-sedol)."
  }
  if (isReservedSlug(slug)) return `“${slug}” is reserved.`
  return others.some((player) => player.slug === slug)
    ? "Another player already uses this slug."
    : undefined
}

function inductionNumberError(
  number: number | null,
  others: readonly Player[],
): string | undefined {
  if (
    number === null ||
    number < 1 ||
    number > PLAYER_LIMITS.maxInductionNumber
  ) {
    return `Enter a whole number from 1 to ${PLAYER_LIMITS.maxInductionNumber}.`
  }
  return others.some(
    (player) => player.inductionNumber === number,
  )
    ? "Another player already has this number."
    : undefined
}

/** A blank number keeps the edited player's current one, and gives a new player the next free one. */
function blankInductionNumber(
  context: PlayerValidationContext,
): number {
  const current = context.existing.find(
    (player) => player.slug === context.originalSlug,
  )
  return (
    current?.inductionNumber ??
    nextInductionNumber(context.existing)
  )
}
