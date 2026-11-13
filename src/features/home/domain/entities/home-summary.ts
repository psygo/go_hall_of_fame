/** A random game of the Hall, with what its card needs. */
export type SpotlightGame = {
  readonly slug: string
  readonly name: string
  readonly year: number
  readonly black: string
  readonly white: string
  readonly blackPlayerSlug: string | null
  readonly whitePlayerSlug: string | null
  readonly result: string
  readonly description: string
  readonly tags: readonly string[]
  /** Where the board loads the record from, or null when the game has none. */
  readonly sgf: string | null
  readonly highlightMove: number | null
}

/** A random player of the Hall, with what their card needs. */
export type SpotlightPlayer = {
  readonly slug: string
  readonly inductionNumber: number
  readonly name: string
  readonly nativeName: string
  readonly country: string
  readonly distinction: string
  readonly photoUrl: string | null
  readonly photoPosition: string
  readonly tags: readonly string[]
}

/** The uploaded text wins over a link, as on the games pages. */
export function spotlightSgfSource(game: {
  readonly slug: string
  readonly sgfUrl: string | null
  readonly hasUploadedSgf: boolean
}): string | null {
  return game.hasUploadedSgf
    ? `/games/${game.slug}/sgf`
    : game.sgfUrl
}

/** What the data holds, before the business rules are applied. */
export type HomeFacts = {
  readonly playerCount: number
  readonly gameCount: number
  readonly firstYear: number | null
  readonly lastYear: number | null
  readonly spotlightGame: SpotlightGame | null
  readonly spotlightPlayer: SpotlightPlayer | null
}

export type HomeSummary = Omit<
  HomeFacts,
  "firstYear" | "lastYear"
> & {
  readonly centuries: number
}

const YEARS_PER_CENTURY = 100

export function countCenturiesSpanned(
  firstYear: number | null,
  lastYear: number | null,
): number {
  if (firstYear === null || lastYear === null) return 0
  return Math.round(
    (lastYear - firstYear) / YEARS_PER_CENTURY,
  )
}

export function summarizeHome(
  facts: HomeFacts,
): HomeSummary {
  const { firstYear, lastYear, ...rest } = facts
  return {
    ...rest,
    centuries: countCenturiesSpanned(firstYear, lastYear),
  }
}
