import { PageHeader } from "@/shared/ui/presentation/page-header"

import { TimelineItemSkeleton } from "../components/timeline-item"

/** Shown by the route while the first chunk of the timeline loads. */
export function TimelineLoadingScreen() {
  return (
    <>
      <PageHeader eyebrow="Timeline" title="Loading…" />
      <section className="relative px-4 pt-12 pb-4">
        <div
          aria-hidden
          className="bg-divider absolute top-0 bottom-0 left-[29px] w-0.5 min-[720px]:left-[calc(50%-1px)]"
        />
        <ol className="m-0 list-none p-0">
          {(
            ["left", "right", "left", "right"] as const
          ).map((side, index) => (
            <TimelineItemSkeleton key={index} side={side} />
          ))}
        </ol>
      </section>
    </>
  )
}
