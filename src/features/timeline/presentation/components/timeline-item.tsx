import Link from "next/link"

import { Markdown } from "@/shared/ui/presentation/markdown"

import type { TimelinePlacement } from "../../domain/entities/timeline-layout"

const cardPlacementClass = {
  left: "min-[720px]:col-start-1 min-[720px]:justify-self-end min-[720px]:text-right",
  right:
    "min-[720px]:col-start-3 min-[720px]:justify-self-start",
} as const

function itemOverlapClass({
  isClustered,
  index,
}: TimelinePlacement) {
  if (index === 0) return ""
  return isClustered
    ? "min-[720px]:-mt-4"
    : "min-[720px]:-mt-14"
}

const ITEM_GRID =
  "relative grid grid-cols-[28px_12px_minmax(0,1fr)] items-start min-[720px]:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)]"

export function TimelineItem({
  placement,
}: {
  readonly placement: TimelinePlacement
}) {
  const { event, side, index } = placement
  const stoneClass = index % 2 === 0 ? "bg-ink" : "bg-stone"

  return (
    <li
      className={`${ITEM_GRID} ${itemOverlapClass(placement)}`}
    >
      <div
        className={`relative col-start-3 row-start-1 mb-8 flex max-w-[460px] flex-col gap-1.5 min-[720px]:mb-12 ${cardPlacementClass[side]}`}
      >
        <div className="text-accent text-[28px] leading-none font-bold min-[720px]:text-[40px]">
          {event.year}
        </div>
        <div className="text-[22px] leading-[1.15] font-bold">
          {event.game === null ? (
            event.title
          ) : (
            // The title's link stretches over the whole event; links inside the text stay above it.
            <Link
              href={`/games/${event.game.slug}`}
              className="text-ink hover:text-accent no-underline after:absolute after:-inset-2 after:content-['']"
              aria-label={`${event.title}: ${event.game.name}`}
            >
              {event.title}
            </Link>
          )}
        </div>
        <div className="[&_a]:relative [&_a]:z-10">
          <Markdown>{event.text}</Markdown>
        </div>
      </div>
      <div
        aria-hidden
        className={`border-ink col-start-1 row-start-1 mt-[5px] size-[18px] justify-self-center rounded-full border-2 shadow-[0_0_0_5px_var(--paper)] min-[720px]:col-start-2 min-[720px]:mt-[11px] ${stoneClass}`}
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
        className={`col-start-3 row-start-1 mb-8 flex w-full max-w-[460px] flex-col gap-2.5 min-[720px]:mb-12 ${cardPlacementClass[side]}`}
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
