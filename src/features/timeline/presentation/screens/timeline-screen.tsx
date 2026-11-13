import { timelineLoaders } from "@/config/di"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import type { TimelinePlacement } from "../../domain/entities/timeline-layout"

export async function TimelineScreen() {
  const placements = await timelineLoaders.loadTimeline()

  return (
    <>
      <PageHeader
        eyebrow="Four centuries"
        title="Timeline"
      />
      <section className="relative px-4 pt-12 pb-4">
        <div
          aria-hidden
          className="bg-divider absolute top-0 bottom-0 left-[29px] w-0.5 min-[720px]:left-[calc(50%-1px)]"
        />
        <ol className="m-0 list-none p-0">
          {placements.map((placement, index) => (
            <TimelineItem
              key={`${placement.event.year}-${placement.event.title}`}
              placement={placement}
              index={index}
            />
          ))}
        </ol>
      </section>
    </>
  )
}

const cardPlacementClass = {
  left: "min-[720px]:col-start-1 min-[720px]:justify-self-end min-[720px]:text-right",
  right:
    "min-[720px]:col-start-3 min-[720px]:justify-self-start",
} as const

function itemOverlapClass(
  { isClustered }: TimelinePlacement,
  index: number,
) {
  if (index === 0) return ""
  return isClustered
    ? "min-[720px]:-mt-4"
    : "min-[720px]:-mt-14"
}

function TimelineItem({
  placement,
  index,
}: {
  readonly placement: TimelinePlacement
  readonly index: number
}) {
  const { event, side } = placement
  const stoneClass = index % 2 === 0 ? "bg-ink" : "bg-stone"

  return (
    <li
      className={`relative grid grid-cols-[28px_12px_minmax(0,1fr)] items-start min-[720px]:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] ${itemOverlapClass(placement, index)}`}
    >
      <div
        className={`col-start-3 row-start-1 mb-8 flex max-w-[460px] flex-col gap-1.5 min-[720px]:mb-12 ${cardPlacementClass[side]}`}
      >
        <div className="text-accent text-[28px] leading-none font-bold min-[720px]:text-[40px]">
          {event.year}
        </div>
        <div className="text-[22px] leading-[1.15] font-bold">
          {event.title}
        </div>
        <div>{event.text}</div>
      </div>
      <div
        aria-hidden
        className={`border-ink col-start-1 row-start-1 mt-[5px] size-[18px] justify-self-center rounded-full border-2 shadow-[0_0_0_5px_var(--paper)] min-[720px]:col-start-2 min-[720px]:mt-[11px] ${stoneClass}`}
      />
    </li>
  )
}
