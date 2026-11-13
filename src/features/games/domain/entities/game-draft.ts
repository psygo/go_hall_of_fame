import {
  validateResourceRows,
  type ResourceLink,
  type ResourceRow,
} from "@/core/resources"
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
  /** The text of an uploaded SGF file, or "" when no file was chosen. */
  readonly sgfFileText: string
  /** The chosen file was over the size limit, so it was not read. */
  readonly sgfFileTooLarge: boolean
  /** Delete the SGF uploaded earlier. */
  readonly removeSgf: boolean
  readonly sequence: string
  readonly featured: boolean
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
  readonly hook: string
  readonly moment: string
  readonly legacy: string
  readonly sgfUrl: string | null
  readonly sequence: number
  readonly featured: boolean
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
  hook: 400,
  moment: 800,
  legacy: 800,
  minYear: 1,
  maxYear: 2999,
  maxSequence: 99,
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
  const sgfUrl = form.sgfUrl.trim()
  const blackPlayerSlug = form.blackPlayerSlug.trim()
  const whitePlayerSlug = form.whitePlayerSlug.trim()
  const playerSlugs = [
    ...new Set([blackPlayerSlug, whitePlayerSlug]),
  ].filter((candidate) => candidate !== "")
  const resources = validateResourceRows(form.resources)
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
    !resources.valid
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
