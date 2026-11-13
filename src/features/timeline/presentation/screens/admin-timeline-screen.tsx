import Link from "next/link"

import { timelineAdminState } from "@/config/di"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { SortableTimelineList } from "../components/sortable-timeline-list"

export async function AdminTimelineScreen() {
  const events =
    await timelineAdminState.loadAdminTimeline()

  return (
    <>
      <PageHeader eyebrow="Admin" title="Timeline">
        <Link
          href="/admin/timeline/new"
          className="btn btn-primary mt-6"
        >
          New event
        </Link>
      </PageHeader>
      <SortableTimelineList
        events={events.map(
          ({ id, year, title, isDraft }) => ({
            id,
            year,
            title,
            isDraft,
          }),
        )}
      />
    </>
  )
}
