import Image from "next/image"
import Link from "next/link"

import { DraftBadge } from "@/shared/ui/presentation/draft-badge"
import { GamePreviewBoard } from "@/shared/go-board/presentation/game-preview-board"
import { Markdown } from "@/shared/ui/presentation/markdown"

import type { TimelinePlacement } from "../../domain/entities/timeline-layout"

const cardPlacementClass = {
  left: "min-[720px]:col-start-1 min-[720px]:justify-self-end min-[720px]:text-right",
  right:
    "min-[720px]:col-start-3 min-[720px]:justify-self-start",
} as const

function itemOverlapClass({ index }: TimelinePlacement) {
  return index === 0 ? "" : "min-[720px]:-mt-14"
}

type RelatedLink = {
  readonly href: string
  readonly label: string
}

const PLACEHOLDER_PORTRAIT_URL =
  "/images/placeholder-portrait.jpg"

const ITEM_GRID =
  "relative grid grid-cols-[28px_12px_minmax(0,1fr)] items-start min-[720px]:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)]"

export function TimelineItem({
  placement,
}: {
  readonly placement: TimelinePlacement
}) {
  const { event, side, index } = placement
  const stoneClass = index % 2 === 0 ? "bg-ink" : "bg-stone"
  // Players show as picture cards, then the contributors and games without a record as chips, then the boards.
  const links: readonly RelatedLink[] = [
    ...event.games
      .filter((game) => game.sgf === null)
      .map((game) => ({
        href: `/games/${game.slug}`,
        label: game.name,
      })),
    ...event.contributors.map((contributor) => ({
      href: `/contributors/${contributor.slug}`,
      label: contributor.name,
    })),
  ]
  const boardGames = event.games.filter(
    (game) => game.sgf !== null,
  )

  return (
    <li
      className={`${ITEM_GRID} ${itemOverlapClass(placement)}`}
    >
      <div
        className={`relative col-start-3 row-start-1 mb-8 flex max-w-[500px] flex-col gap-1.5 min-[720px]:mb-12 ${cardPlacementClass[side]}`}
      >
        <div className="text-accent text-[28px] leading-none font-bold min-[720px]:text-[40px]">
          {event.year}
        </div>
        <DraftBadge isDraft={event.isDraft} />
        <div className="text-[22px] leading-[1.15] font-bold">
          {event.title}
        </div>
        <div className="[&_a]:relative [&_a]:z-10">
          <Markdown>{event.text}</Markdown>
        </div>
        {event.players.length > 0 && (
          <ul
            aria-label="Players"
            className={`m-0 flex list-none flex-wrap gap-2 p-0 ${side === "left" ? "min-[720px]:justify-end" : ""}`}
          >
            {event.players.map((player) => (
              <li key={player.slug} className="max-w-full">
                <Link
                  href={`/players/${player.slug}`}
                  className="border-divider text-ink hover:bg-accent-100 hover:text-accent flex max-w-[88px] flex-col items-center gap-1 border p-1.5 text-center text-xs font-bold no-underline"
                >
                  <span className="relative block aspect-[4/5] w-[50px] overflow-hidden">
                    <Image
                      src={
                        player.photoUrl ??
                        PLACEHOLDER_PORTRAIT_URL
                      }
                      alt=""
                      fill
                      sizes="50px"
                      className="object-cover"
                      style={{
                        objectPosition:
                          player.photoPosition,
                      }}
                    />
                  </span>
                  {player.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {links.length > 0 && (
          <ul
            aria-label="Related"
            className={`relative z-10 m-0 flex list-none flex-wrap gap-1.5 p-0 ${side === "left" ? "min-[720px]:justify-end" : ""}`}
          >
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="border-divider hover:text-accent hover:border-accent inline-block border px-2 py-0.5 text-sm font-bold no-underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {boardGames.length > 0 && (
          <div
            className={`flex flex-wrap gap-2 ${side === "left" ? "min-[720px]:justify-end" : ""}`}
          >
            {boardGames.map((game) => (
              <article
                key={game.slug}
                className={`border-divider hover:bg-accent-100 relative flex w-[240px] max-w-full flex-col border p-2 text-left ${event.showGameTitles ? "gap-1.5" : ""}`}
              >
                <Link
                  href={`/games/${game.slug}`}
                  className="text-ink hover:text-accent text-center text-sm font-bold no-underline after:absolute after:inset-0 after:content-['']"
                >
                  {event.showGameTitles ? (
                    game.name
                  ) : (
                    <span className="sr-only">
                      {game.name}
                    </span>
                  )}
                </Link>
                {game.sgf !== null && (
                  <GamePreviewBoard
                    sgf={game.sgf}
                    targetMove={
                      game.highlightMove ?? undefined
                    }
                  />
                )}
              </article>
            ))}
          </div>
        )}
      </div>
      <div
        aria-hidden
        className={`border-ink col-start-1 row-start-1 mt-[5px] size-[18px] justify-self-center rounded-full border-2 min-[720px]:col-start-2 min-[720px]:mt-[11px] ${stoneClass}`}
      />
    </li>
  )
}

/** A placeholder shaped like an event, shown while the next chunk loads. */
export function TimelineItemSkeleton({
  side,
}: {
  readonly side: "left" | "right"
}) {
  return (
    <li
      aria-hidden
      className={`${ITEM_GRID} animate-pulse`}
    >
      <div
        className={`col-start-3 row-start-1 mb-8 flex w-full max-w-[500px] flex-col gap-2.5 min-[720px]:mb-12 ${cardPlacementClass[side]}`}
      >
        <div className="bg-divider h-9 w-24 min-[720px]:self-auto" />
        <div className="bg-divider h-5 w-3/4" />
        <div className="bg-divider h-4 w-full" />
        <div className="bg-divider h-4 w-5/6" />
      </div>
      <div className="border-divider col-start-1 row-start-1 mt-[5px] size-[18px] justify-self-center rounded-full border-2 min-[720px]:col-start-2 min-[720px]:mt-[11px]" />
    </li>
  )
}
