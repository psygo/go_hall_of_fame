import { findCircularNeighbors } from "@/core/circular-neighbors"

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
}

export type PlayerGameReference = {
  readonly slug: string
  readonly year: number
  readonly name: string
}

export type PlayerDetail = Player & {
  readonly games: readonly PlayerGameReference[]
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
