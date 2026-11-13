import {
  validateResourceRows,
  type ResourceLink,
  type ResourceRow,
} from "@/core/resources"
import { validateTags } from "@/core/tags"
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
  readonly description: string
  readonly sgfUrl: string
  /** The text of an uploaded SGF file, or "" when no file was chosen. */
  readonly sgfFileText: string
  /** The chosen file was over the size limit, so it was not read. */
  readonly sgfFileTooLarge: boolean
  /** Delete the SGF uploaded earlier. */
  readonly removeSgf: boolean
  readonly sequence: string
  /** The move to highlight, or "" for the default (move 50). */
  readonly highlightMove: string
  /** Comma-separated, optional. */
  readonly tags: string
  /** The slug of the Hall player who played Black / White, or "" for none. */
  readonly blackPlayerSlug: string
  readonly whitePlayerSlug: string
  readonly resources: readonly ResourceRow[]
}

/** What saving does with the stored SGF text. */
export type SgfChange =
  | { readonly kind: "keep" }
  | { readonly kind: "remove" }
  | { readonly kind: "replace"; readonly text: string }

export type GameDraft = {
  readonly slug: string
  readonly year: number
  readonly name: string
  readonly black: string
  readonly white: string
  readonly result: string
  readonly setting: string
  readonly description: string
  readonly sgfUrl: string | null
  readonly sequence: number
  readonly highlightMove: number | null
  readonly tags: readonly string[]
  readonly blackPlayerSlug: string | null
  readonly whitePlayerSlug: string | null
  /** The Black and White players, without repeats: the players listed on the game. */
  readonly playerSlugs: readonly string[]
  readonly sgf: SgfChange
  readonly resources: readonly ResourceLink[]
}

export type GameErrors = FieldErrors

export const GAME_LIMITS = {
  name: 120,
  side: 80,
  result: 80,
  setting: 80,
  description: 3000,
  minYear: 1,
  maxYear: 2999,
  maxSequence: 99,
  maxHighlightMove: 1000,
  maxSgfBytes: 400_000,
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
  const highlightMove =
    form.highlightMove.trim() === ""
      ? null
      : parseInteger(form.highlightMove)
  const sgfUrl = form.sgfUrl.trim()
  const blackPlayerSlug = form.blackPlayerSlug.trim()
  const whitePlayerSlug = form.whitePlayerSlug.trim()
  const playerSlugs = [
    ...new Set([blackPlayerSlug, whitePlayerSlug]),
  ].filter((candidate) => candidate !== "")
  const resources = validateResourceRows(form.resources)
  const tags = validateTags(form.tags)
  const known = new Set(
    context.playerOptions.map((player) => player.slug),
  )

  const errors = collectErrors({
    tags: tags.valid ? undefined : tags.error,
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
    description: required(
      form.description.trim(),
      GAME_LIMITS.description,
      "a description",
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
    highlightMove: highlightMoveError(highlightMove, form),
    sgfFile: sgfFileError(form),
    blackPlayerSlug: knownPlayerError(
      blackPlayerSlug,
      known,
    ),
    whitePlayerSlug: knownPlayerError(
      whitePlayerSlug,
      known,
    ),
    resources: resources.valid
      ? undefined
      : resources.error,
  })
  if (
    Object.keys(errors).length > 0 ||
    year === null ||
    sequence === null ||
    !resources.valid ||
    !tags.valid
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
      description: form.description.trim(),
      sgfUrl: sgfUrl === "" ? null : sgfUrl,
      sequence,
      highlightMove,
      tags: tags.tags,
      blackPlayerSlug: blackPlayerSlug || null,
      whitePlayerSlug: whitePlayerSlug || null,
      playerSlugs,
      sgf: sgfChangeOf(form),
      resources: resources.links,
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

function knownPlayerError(
  slug: string,
  known: ReadonlySet<string>,
): string | undefined {
  return slug === "" || known.has(slug)
    ? undefined
    : "Choose a player who is in the Hall."
}

/** An SGF is a parenthesised tree that opens with a node: "(;". */
function sgfFileError(form: GameForm): string | undefined {
  if (form.sgfFileTooLarge) {
    return "The SGF file is too large (400 KB at most)."
  }
  if (form.sgfFileText.trim() === "") return undefined
  return isPlausibleSgf(form.sgfFileText)
    ? undefined
    : "This does not look like an SGF file: it should be a (;…) tree with balanced parentheses."
}

/**
 * Starts with "(;" and every "(" is closed outside the [bracketed] property values (where a
 * backslash escapes the next character). A light check: it does not parse properties.
 */
export function isPlausibleSgf(text: string): boolean {
  if (!/^\s*\(\s*;/.test(text)) return false
  let depth = 0
  let inValue = false
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (inValue) {
      if (char === "\\") index++
      else if (char === "]") inValue = false
    } else if (char === "[") inValue = true
    else if (char === "(") depth++
    else if (char === ")") {
      depth--
      if (depth < 0) return false
    }
  }
  return depth === 0 && !inValue
}

function sgfChangeOf(form: GameForm): SgfChange {
  if (form.sgfFileText.trim() !== "") {
    return { kind: "replace", text: form.sgfFileText }
  }
  return form.removeSgf
    ? { kind: "remove" }
    : { kind: "keep" }
}

function highlightMoveError(
  move: number | null,
  form: GameForm,
): string | undefined {
  if (form.highlightMove.trim() === "") return undefined
  const valid =
    move !== null &&
    move >= 1 &&
    move <= GAME_LIMITS.maxHighlightMove
  return valid
    ? undefined
    : `Enter a move between 1 and ${GAME_LIMITS.maxHighlightMove}, or leave it blank for move 50.`
}
