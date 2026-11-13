import Link from "next/link"

import { timelineAdminState } from "@/config/di"
import {
  AdminList,
  AdminListRow,
} from "@/shared/ui/presentation/admin-section"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { deleteTimelineEventAction } from "../state/timeline-admin-actions"
import { ConfirmDeleteButton } from "@/shared/ui/presentation/confirm-delete-button"

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
      <AdminList>
        {events.map((event) => (
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
    </>
  )
}
