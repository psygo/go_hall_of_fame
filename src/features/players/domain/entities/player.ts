import { findCircularNeighbors } from "@/core/circular-neighbors"
import { matchesQuery } from "@/core/list-query"
import type { ResourceLink } from "@/core/resources"

export const COUNTRIES = [
  "Japan",
  "China",
  "Korea",
] as const

export type Country = (typeof COUNTRIES)[number]

export type Player = {
  readonly slug: string
  readonly inductionNumber: number
  readonly name: string
  readonly nativeName: string
  readonly country: Country
  readonly years: string
  readonly distinction: string
  readonly bio: string
  readonly photoUrl: string | null
  readonly photoPosition: string
  readonly featured: boolean
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
  "number",
  "newest",
  "name",
  "country",
] as const

export type PlayerSort = (typeof PLAYER_SORTS)[number]

export const PLAYER_SORT_LABELS: Readonly<
  Record<PlayerSort, string>
> = {
  number: "Induction number",
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
      ],
      query,
    ),
  )
}

/** The list arrives ordered by induction number. */
export function sortPlayers(
  players: readonly Player[],
  sort: PlayerSort,
): readonly Player[] {
  if (sort === "number") return players
  if (sort === "newest") return [...players].reverse()
  if (sort === "name") {
    return [...players].sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  }
  return [...players].sort(
    (a, b) =>
      a.country.localeCompare(b.country) ||
      a.inductionNumber - b.inductionNumber,
  )
}
