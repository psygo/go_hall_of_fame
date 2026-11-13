import { findCircularNeighbors } from "@/core/circular-neighbors"
import { matchesQuery } from "@/core/list-query"
import type { ResourceLink } from "@/core/resources"

export type Game = {
  readonly slug: string
  readonly year: number
  readonly name: string
  readonly black: string
  readonly white: string
  /** The Hall player behind the Black / White name, when there is one. */
  readonly blackPlayerSlug: string | null
  readonly whitePlayerSlug: string | null
  readonly result: string
  readonly setting: string
  /** What the game is about, in Markdown. */
  readonly description: string
  /** An SGF kept elsewhere (a site path or an https URL). */
  readonly sgfUrl: string | null
  /** An SGF file was uploaded; its text is served at /games/{slug}/sgf. */
  readonly hasUploadedSgf: boolean
  /** The move (1-based) the preview stops on and draws in the accent color; null means move 50. */
  readonly highlightMove: number | null
  readonly featured: boolean
  readonly tags: readonly string[]
  /** Orders games played in the same year. */
  readonly sequence: number
}

export type GamePlayerReference = {
  readonly slug: string
  readonly name: string
}

export type GameDetail = Game & {
  readonly players: readonly GamePlayerReference[]
  readonly resources: readonly ResourceLink[]
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

export const GAMES_PAGE_SIZE = 6

export const DEFAULT_HIGHLIGHT_MOVE = 50

export function highlightMoveOf(
  game: Pick<Game, "highlightMove">,
): number {
  return game.highlightMove ?? DEFAULT_HIGHLIGHT_MOVE
}

export const GAME_SORTS = [
  "newest",
  "oldest",
  "name",
] as const

export type GameSort = (typeof GAME_SORTS)[number]

export const DEFAULT_GAME_SORT: GameSort = "newest"

export const GAME_SORT_LABELS: Readonly<
  Record<GameSort, string>
> = {
  oldest: "Oldest first",
  newest: "Newest first",
  name: "Name A–Z",
}

/** Where the board loads the record from: the uploaded text wins over a link. */
export function sgfSourceOf(
  game: Pick<Game, "slug" | "sgfUrl" | "hasUploadedSgf">,
): string | null {
  return game.hasUploadedSgf
    ? `/games/${game.slug}/sgf`
    : game.sgfUrl
}

export function searchGames(
  games: readonly Game[],
  query: string,
): readonly Game[] {
  return games.filter((game) =>
    matchesQuery(
      [
        game.name,
        game.black,
        game.white,
        String(game.year),
        game.setting,
        game.description,
        ...game.tags,
      ],
      query,
    ),
  )
}

/** The list arrives in chronological order, so "oldest" keeps it. */
export function sortGames(
  games: readonly Game[],
  sort: GameSort,
): readonly Game[] {
  if (sort === "oldest") return games
  if (sort === "newest") return [...games].reverse()
  return [...games].sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}
