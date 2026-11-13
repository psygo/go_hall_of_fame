import { isValidSlug, slugify } from "@/core/slugify"
import {
  collectErrors,
  isReservedSlug,
  isSafeAssetUrl,
  parseInteger,
  type FieldErrors,
  type Validation,
} from "@/core/validation"

import {
  isContributorKind,
  type Contributor,
  type ContributorKind,
} from "./contributor"

/** What the admin form submits: every field is text, as typed. */
export type ContributorForm = {
  readonly slug: string
  readonly name: string
  readonly kind: string
  /** The year of birth or founding, as typed. */
  readonly birthYear: string
  readonly role: string
  readonly period: string
  readonly bio: string
  readonly photoUrl: string
  readonly photoPosition: string
  readonly isDraft: boolean
}

export type ContributorDraft = {
  readonly slug: string
  readonly name: string
  readonly kind: ContributorKind
  readonly birthYear: number
  readonly role: string
  readonly period: string
  readonly bio: string
  readonly photoUrl: string | null
  readonly photoPosition: string
  readonly isDraft: boolean
}

export type ContributorErrors = FieldErrors

export const CONTRIBUTOR_LIMITS = {
  name: 120,
  role: 140,
  period: 40,
  bio: 2000,
  minBirthYear: 1,
  maxBirthYear: 2999,
} as const

export const DEFAULT_PHOTO_POSITION = "50% 50%"
const PHOTO_POSITION_PATTERN =
  /^(?:100|\d{1,2})% (?:100|\d{1,2})%$/

export type ContributorValidationContext = {
  /** Every contributor now listed, to check slugs stay unique. */
  readonly existing: readonly Contributor[]
  /** The slug of the contributor being edited, or null when creating. */
  readonly originalSlug: string | null
}

export function validateContributorForm(
  form: ContributorForm,
  context: ContributorValidationContext,
): Validation<ContributorDraft, ContributorErrors> {
  const name = form.name.trim()
  const slug = form.slug.trim() || slugify(name)
  const birthYear = parseInteger(form.birthYear)
  const role = form.role.trim()
  const period = form.period.trim()
  const bio = form.bio.trim()
  const photoUrl = form.photoUrl.trim()
  const photoPosition =
    form.photoPosition.trim() || DEFAULT_PHOTO_POSITION
  const others = context.existing.filter(
    (contributor) =>
      contributor.slug !== context.originalSlug,
  )

  const errors = collectErrors({
    name: requiredText(
      name,
      CONTRIBUTOR_LIMITS.name,
      "a name",
    ),
    slug: slugError(slug, others),
    kind: isContributorKind(form.kind)
      ? undefined
      : "Choose person, organization or entity.",
    birthYear: birthYearError(birthYear),
    role: requiredText(
      role,
      CONTRIBUTOR_LIMITS.role,
      "what they contributed",
    ),
    period:
      period.length > CONTRIBUTOR_LIMITS.period
        ? `Use at most ${CONTRIBUTOR_LIMITS.period} characters.`
        : undefined,
    bio: requiredText(
      bio,
      CONTRIBUTOR_LIMITS.bio,
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
  })
  if (
    Object.keys(errors).length > 0 ||
    birthYear === null ||
    !isContributorKind(form.kind)
  ) {
    return { valid: false, errors }
  }
  return {
    valid: true,
    draft: {
      slug,
      name,
      kind: form.kind,
      birthYear,
      role,
      period,
      bio,
      photoUrl: photoUrl === "" ? null : photoUrl,
      photoPosition,
      isDraft: form.isDraft,
    },
  }
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

function birthYearError(
  year: number | null,
): string | undefined {
  const isValid =
    year !== null &&
    year >= CONTRIBUTOR_LIMITS.minBirthYear &&
    year <= CONTRIBUTOR_LIMITS.maxBirthYear
  return isValid
    ? undefined
    : `Enter the year of birth or founding, between ${CONTRIBUTOR_LIMITS.minBirthYear} and ${CONTRIBUTOR_LIMITS.maxBirthYear}.`
}

function slugError(
  slug: string,
  others: readonly Contributor[],
): string | undefined {
  if (!isValidSlug(slug)) {
    return "Use lowercase letters, digits and hyphens (for example demis-hassabis)."
  }
  if (isReservedSlug(slug)) return `“${slug}” is reserved.`
  return others.some(
    (contributor) => contributor.slug === slug,
  )
    ? "Another contributor already uses this slug."
    : undefined
}
