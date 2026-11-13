import { findCircularNeighbors } from "@/core/circular-neighbors"
import { matchesQuery } from "@/core/list-query"
import type { ResourceLink } from "@/core/resources"

export const COUNTRIES = [
  "Japan",
  "China",
  "Korea",
  "Others",
] as const

export type Country = (typeof COUNTRIES)[number]

export type Player = {
  readonly slug: string
  readonly inductionNumber: number
  readonly name: string
  readonly nativeName: string
  readonly country: Country
  readonly years: string
  /** The year of birth, the chronological order of the Hall. */
  readonly birthYear: number
  readonly distinction: string
  readonly bio: string
  readonly photoUrl: string | null
  readonly photoPosition: string
  readonly tags: readonly string[]
  /** Only admins see a draft. */
  readonly isDraft: boolean
}

export type PlayerGameReference = {
  readonly slug: string
  readonly year: number
  readonly name: string
}

export type PlayerDetail = Player & {
  readonly games: readonly PlayerGameReference[]
  readonly resources: readonly ResourceLink[]
}

export type PlayerProfile = {
  readonly detail: PlayerDetail
  readonly previous: Player
  readonly next: Player
}

export function isCountry(
  value: unknown,
): value is Country {
  return COUNTRIES.some((country) => country === value)
}

export function filterPlayersByCountry(
  players: readonly Player[],
  country: Country | null,
): readonly Player[] {
  if (country === null) return players
  return players.filter(
    (player) => player.country === country,
  )
}

export function findNeighborsOfPlayer(
  players: readonly Player[],
  slug: string,
) {
  const index = players.findIndex(
    (player) => player.slug === slug,
  )
  return findCircularNeighbors(players, index)
}

export const PLAYERS_PAGE_SIZE = 12

export const PLAYER_SORTS = [
  "chronological",
  "youngest",
  "number",
  "newest",
  "name",
  "country",
] as const

export type PlayerSort = (typeof PLAYER_SORTS)[number]

export const DEFAULT_PLAYER_SORT: PlayerSort = "youngest"

export const PLAYER_SORT_LABELS: Readonly<
  Record<PlayerSort, string>
> = {
  chronological: "Oldest born first",
  youngest: "Youngest born first",
  number: "Earliest inducted",
  newest: "Latest inducted",
  name: "Name A–Z",
  country: "Country",
}

export function searchPlayers(
  players: readonly Player[],
  query: string,
): readonly Player[] {
  return players.filter((player) =>
    matchesQuery(
      [
        player.name,
        player.nativeName,
        player.country,
        player.distinction,
        player.years,
        ...player.tags,
      ],
      query,
    ),
  )
}

/** Born earlier first; the induction number settles players born in the same year. */
export function compareChronologically(
  a: Player,
  b: Player,
) {
  return (
    a.birthYear - b.birthYear ||
    a.inductionNumber - b.inductionNumber
  )
}

export function sortPlayers(
  players: readonly Player[],
  sort: PlayerSort,
): readonly Player[] {
  const sorted = [...players]
  if (sort === "chronological") {
    return sorted.sort(compareChronologically)
  }
  if (sort === "youngest") {
    return sorted.sort((a, b) =>
      compareChronologically(b, a),
    )
  }
  if (sort === "number") {
    return sorted.sort(
      (a, b) => a.inductionNumber - b.inductionNumber,
    )
  }
  if (sort === "newest") {
    return sorted.sort(
      (a, b) => b.inductionNumber - a.inductionNumber,
    )
  }
  if (sort === "name") {
    return sorted.sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  }
  return sorted.sort(
    (a, b) =>
      a.country.localeCompare(b.country) ||
      compareChronologically(a, b),
  )
}
