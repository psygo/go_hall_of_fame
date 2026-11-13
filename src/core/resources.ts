import { isSafeAssetUrl } from "./validation"

/** A link with an optional description, listed on a game's or a player's page. */
export type ResourceLink = {
  readonly url: string
  readonly description: string | null
}

/** One row of the resource editor, as typed. */
export type ResourceRow = {
  readonly url: string
  readonly description: string
}

export const RESOURCE_LIMITS = {
  maxCount: 20,
  url: 500,
  description: 200,
} as const

export type ResourcesValidation =
  | {
      readonly valid: true
      readonly links: readonly ResourceLink[]
    }
  | { readonly valid: false; readonly error: string }

/** Rows with neither a link nor a description are dropped; the rest need a safe link. */
export function validateResourceRows(
  rows: readonly ResourceRow[],
): ResourcesValidation {
  const filled = rows
    .map((row) => ({
      url: row.url.trim(),
      description: row.description.trim(),
    }))
    .filter(
      (row) => row.url !== "" || row.description !== "",
    )
  if (filled.length > RESOURCE_LIMITS.maxCount) {
    return {
      valid: false,
      error: `Add at most ${RESOURCE_LIMITS.maxCount} resources.`,
    }
  }
  const problem = filled
    .map(describeProblem)
    .find((message) => message !== undefined)
  if (problem !== undefined) {
    return { valid: false, error: problem }
  }
  return {
    valid: true,
    links: filled.map(({ url, description }) => ({
      url,
      description: description === "" ? null : description,
    })),
  }
}

function describeProblem(
  row: ResourceRow,
): string | undefined {
  if (row.url === "") return "Each resource needs a link."
  if (row.url.length > RESOURCE_LIMITS.url) {
    return `Keep each link to ${RESOURCE_LIMITS.url} characters.`
  }
  if (!isSafeAssetUrl(row.url)) {
    return `"${row.url.slice(0, 40)}" is not a valid link: use https:// or a path on this site.`
  }
  return row.description.length >
    RESOURCE_LIMITS.description
    ? `Keep each description to ${RESOURCE_LIMITS.description} characters.`
    : undefined
}
