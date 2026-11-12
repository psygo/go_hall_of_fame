export type FeaturedGame = {
  readonly slug: string
  readonly name: string
  readonly year: number
  readonly black: string
  readonly white: string
  readonly hook: string
}

export type FeaturedPlayer = {
  readonly slug: string
  readonly name: string
  readonly nativeName: string
  readonly years: string
  readonly photoUrl: string | null
  readonly photoPosition: string
}

/** What the data holds, before the business rules are applied. */
export type HomeFacts = {
  readonly playerCount: number
  readonly gameCount: number
  readonly firstYear: number | null
  readonly lastYear: number | null
  readonly featuredGame: FeaturedGame | null
  readonly featuredPlayer: FeaturedPlayer | null
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
