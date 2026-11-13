import {
  contentLoaders,
  timelineLoaders,
} from "@/config/di"
import { ListControls } from "@/shared/ui/presentation/list-controls"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import {
  TIMELINE_ORDER_LABELS,
  TIMELINE_ORDERS,
} from "../../domain/entities/timeline-layout"
import { TimelineFeed } from "../components/timeline-feed"
import type { TimelineSearchParams } from "../state/timeline-loaders"

type TimelineScreenProps = {
  readonly searchParams: Promise<TimelineSearchParams>
}

export async function TimelineScreen({
  searchParams,
}: TimelineScreenProps) {
  const params = await searchParams
  const [{ order, first }, texts] = await Promise.all([
    timelineLoaders.loadTimelinePage(params),
    contentLoaders.loadPageTexts("timeline"),
  ])

  return (
    <>
      <PageHeader
        eyebrow={texts["timeline.eyebrow"]}
        title={texts["timeline.title"]}
      >
        <ListControls
          sort={{
            value: order,
            options: TIMELINE_ORDERS.map((value) => ({
              value,
              label: TIMELINE_ORDER_LABELS[value],
            })),
          }}
        />
      </PageHeader>
      <section className="relative px-4 pt-12 pb-4">
        <div
          aria-hidden
          className="bg-divider absolute top-0 bottom-0 left-[29px] w-0.5 min-[720px]:left-[calc(50%-1px)]"
        />
        <TimelineFeed
          key={order}
          order={order}
          first={first}
        />
      </section>
    </>
  )
}
