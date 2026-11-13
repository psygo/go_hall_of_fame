import type { QueryParam } from "@/core/list-query"
import Link from "next/link"

import { timelineAdminState } from "@/config/di"
import {
  AdminList,
  AdminListRow,
} from "@/shared/ui/presentation/admin-section"
import { Pagination } from "@/shared/ui/presentation/pagination"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { deleteTimelineEventAction } from "../state/timeline-admin-actions"
import { ConfirmDeleteButton } from "@/shared/ui/presentation/confirm-delete-button"

export async function AdminTimelineScreen({
  searchParams,
}: {
  readonly searchParams: Promise<{
    readonly page?: QueryParam
  }>
}) {
  const { page: pageParam } = await searchParams
  const events =
    await timelineAdminState.loadAdminTimeline(pageParam)

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
      <AdminList>
        {events.items.map((event) => (
          <AdminListRow key={event.id}>
            <div>
              <span className="text-accent mr-3 font-bold">
                {event.year}
              </span>
              <span className="font-bold">
                {event.title}
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/timeline/${event.id}`}
                className="btn btn-secondary"
              >
                Edit
              </Link>
              <ConfirmDeleteButton
                action={deleteTimelineEventAction.bind(
                  null,
                  event.id,
                )}
                label="Delete"
                confirmText={`Delete “${event.title}” from the timeline?`}
              />
            </div>
          </AdminListRow>
        ))}
      </AdminList>
      <Pagination
        page={events.page}
        pageCount={events.pageCount}
        basePath="/admin/timeline"
      />
    </>
  )
}
