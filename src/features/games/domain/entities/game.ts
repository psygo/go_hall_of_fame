import { findCircularNeighbors } from "@/core/circular-neighbors"

export type Game = {
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
}

export type GamePlayerReference = {
  readonly slug: string
  readonly name: string
}

export type GameDetail = Game & {
  readonly players: readonly GamePlayerReference[]
}

export type GameProfile = {
  readonly detail: GameDetail
  readonly previous: Game
  readonly next: Game
}

export function findNeighborsOfGame(
  games: readonly Game[],
  slug: string,
) {
  const index = games.findIndex(
    (game) => game.slug === slug,
  )
  return findCircularNeighbors(games, index)
}
