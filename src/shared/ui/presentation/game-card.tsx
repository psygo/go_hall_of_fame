import Link from "next/link"

import { excerpt } from "@/core/markdown"
import { GamePreviewBoard } from "@/shared/go-board/presentation/game-preview-board"

import { PlayerName } from "./player-name"
import { TagList } from "./tag-list"

export type GameCardGame = {
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
  /** Where the board loads the record from, or null for a game without one. */
  readonly sgf: string | null
  readonly highlightMove: number | null
}

/**
 * A game as a row of the games list. The title's link stretches over the whole card (the board
 * included); the player links sit above it (relative z-10), so they keep working. The board replays
 * the game while the card is hovered or focused.
 */
export function GameCard({
  game,
}: {
  readonly game: GameCardGame
}) {
  return (
    <article className="border-divider hover:bg-accent-100 has-[a:focus-visible]:outline-accent relative grid grid-cols-1 border-b has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 min-[720px]:grid-cols-[160px_minmax(0,1fr)_280px]">
      <div className="text-accent min-[720px]:border-divider px-4 pt-6 text-4xl leading-none font-bold min-[720px]:border-r min-[720px]:pb-6">
        {game.year}
      </div>
      <div className="flex flex-col gap-2 px-4 py-6">
        <h2 className="m-0 text-[28px] leading-[1.05] font-bold">
          <Link
            href={`/games/${game.slug}`}
            className="text-ink no-underline after:absolute after:inset-0 after:content-['']"
          >
            {game.name}
          </Link>
        </h2>
        <div className="text-[13px] font-bold">
          <span className="relative z-10">
            <PlayerName
              name={game.black}
              slug={game.blackPlayerSlug}
            />
          </span>{" "}
          vs{" "}
          <span className="relative z-10">
            <PlayerName
              name={game.white}
              slug={game.whitePlayerSlug}
            />
          </span>{" "}
          · {game.result}
        </div>
        <div className="max-w-[62ch]">
          {excerpt(game.description)}
        </div>
        <TagList tags={game.tags} />
      </div>
      {game.sgf !== null && (
        <div className="px-4 pb-6 min-[720px]:self-center min-[720px]:py-6 min-[720px]:pl-0">
          <GamePreviewBoard
            sgf={game.sgf}
            targetMove={game.highlightMove ?? undefined}
          />
        </div>
      )}
    </article>
  )
}
