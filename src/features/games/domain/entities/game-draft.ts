import { isValidSlug, slugify } from "@/core/slugify"
import {
  collectErrors,
  isReservedSlug,
  isSafeAssetUrl,
  parseInteger,
  type FieldErrors,
  type Validation,
} from "@/core/validation"

import type { Game, GamePlayerReference } from "./game"

export type GameForm = {
  readonly slug: string
  readonly year: string
  readonly name: string
  readonly black: string
  readonly white: string
  readonly result: string
  readonly setting: string
  readonly hook: string
  readonly moment: string
  readonly legacy: string
  readonly sgfUrl: string
  readonly sequence: string
  readonly featured: boolean
  /** Slugs of the inducted players who played the game. */
  readonly playerSlugs: readonly string[]
}

export type GameDraft = {
  readonly slug: string
  readonly year: number
  readonly name: string
  readonly black: string
  readonly white: string
  readonly result: string
  readonly setting: string
  readonly hook: string
  readonly moment: string
  readonly legacy: string
  readonly sgfUrl: string | null
  readonly sequence: number
  readonly featured: boolean
  readonly playerSlugs: readonly string[]
}

export type GameErrors = FieldErrors

export const GAME_LIMITS = {
  name: 120,
  side: 80,
  result: 80,
  setting: 80,
  hook: 400,
  moment: 800,
  legacy: 800,
  minYear: 1,
  maxYear: 2999,
  maxSequence: 99,
} as const

export type GameValidationContext = {
  readonly existing: readonly Game[]
  /** The slug of the game being edited, or null when creating. */
  readonly originalSlug: string | null
  readonly playerOptions: readonly GamePlayerReference[]
}

export function validateGameForm(
  form: GameForm,
  context: GameValidationContext,
): Validation<GameDraft, GameErrors> {
  const name = form.name.trim()
  const slug = form.slug.trim() || slugify(name)
  const year = parseInteger(form.year)
  const sequence =
    form.sequence.trim() === ""
      ? 0
      : parseInteger(form.sequence)
  const sgfUrl = form.sgfUrl.trim()
  const playerSlugs = [...new Set(form.playerSlugs)]
  const known = new Set(
    context.playerOptions.map((player) => player.slug),
  )

  const errors = collectErrors({
    name: required(name, GAME_LIMITS.name, "a name"),
    slug: slugError(slug, context),
    year: rangeError(
      year,
      GAME_LIMITS.minYear,
      GAME_LIMITS.maxYear,
      "a year",
    ),
    black: required(
      form.black.trim(),
      GAME_LIMITS.side,
      "the Black player",
    ),
    white: required(
      form.white.trim(),
      GAME_LIMITS.side,
      "the White player",
    ),
    result: required(
      form.result.trim(),
      GAME_LIMITS.result,
      "the result",
    ),
    setting: required(
      form.setting.trim(),
      GAME_LIMITS.setting,
      "the setting",
    ),
    hook: required(
      form.hook.trim(),
      GAME_LIMITS.hook,
      "the hook",
    ),
    moment: required(
      form.moment.trim(),
      GAME_LIMITS.moment,
      "the moment",
    ),
    legacy: required(
      form.legacy.trim(),
      GAME_LIMITS.legacy,
      "why it endures",
    ),
    sgfUrl:
      sgfUrl === "" || isSafeAssetUrl(sgfUrl)
        ? undefined
        : "Use a path such as /sgf/name.sgf, or an https URL.",
    sequence: rangeError(
      sequence,
      0,
      GAME_LIMITS.maxSequence,
      "an order from 0",
    ),
    playerSlugs: playerSlugs.every((candidate) =>
      known.has(candidate),
    )
      ? undefined
      : "Choose only players who are in the Hall.",
  })
  if (
    Object.keys(errors).length > 0 ||
    year === null ||
    sequence === null
  ) {
    return { valid: false, errors }
  }
  return {
    valid: true,
    draft: {
      slug,
      year,
      name,
      black: form.black.trim(),
      white: form.white.trim(),
      result: form.result.trim(),
      setting: form.setting.trim(),
      hook: form.hook.trim(),
      moment: form.moment.trim(),
      legacy: form.legacy.trim(),
      sgfUrl: sgfUrl === "" ? null : sgfUrl,
      sequence,
      featured: form.featured,
      playerSlugs,
    },
  }
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

function rangeError(
  value: number | null,
  min: number,
  max: number,
  what: string,
): string | undefined {
  const inRange =
    value !== null && value >= min && value <= max
  return inRange
    ? undefined
    : `Enter ${what} between ${min} and ${max}.`
}

function slugError(
  slug: string,
  context: GameValidationContext,
): string | undefined {
  if (!isValidSlug(slug)) {
    return "Use lowercase letters, digits and hyphens (for example alphago-game-4)."
  }
  if (isReservedSlug(slug)) return `“${slug}” is reserved.`
  const taken = context.existing.some(
    (game) =>
      game.slug === slug &&
      game.slug !== context.originalSlug,
  )
  return taken
    ? "Another game already uses this slug."
    : undefined
}
