import type { QueryParam } from "@/core/list-query"
import { feedbackAdminState } from "@/config/di"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"
import { ConfirmDeleteButton } from "@/shared/ui/presentation/confirm-delete-button"
import { PageHeader } from "@/shared/ui/presentation/page-header"
import { Pagination } from "@/shared/ui/presentation/pagination"

import {
  deleteFeedbackAction,
  setFeedbackReadAction,
} from "../state/feedback-admin-actions"

export async function AdminFeedbackScreen({
  searchParams,
}: {
  readonly searchParams: Promise<{
    readonly page?: QueryParam
  }>
}) {
  const { page: pageParam } = await searchParams
  const feedback =
    await feedbackAdminState.loadFeedback(pageParam)

  return (
    <>
      <PageHeader eyebrow="Admin" title="Feedback" />
      {feedback.total === 0 && (
        <p className="px-4 py-10">No feedback yet.</p>
      )}
      <ul className="m-0 list-none p-0">
        {feedback.items.map((item) => (
          <li
            key={item.id}
            className="border-divider flex flex-col gap-3 border-b px-4 py-5"
          >
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${item.email}`}
                className="font-bold"
              >
                {item.email}
              </a>
              <span
                className={`tag ${item.isRead ? "" : "tag-accent"}`}
              >
                {item.isRead ? "Read" : "New"}
              </span>
              <span className="text-xs opacity-70">
                {item.createdAt.toISOString().slice(0, 10)}
              </span>
            </div>
            <p className="max-w-[70ch] whitespace-pre-line">
              {item.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <form
                action={setFeedbackReadAction.bind(
                  null,
                  item.id,
                  !item.isRead,
                )}
              >
                <button
                  type="submit"
                  className="btn btn-secondary"
                >
                  Mark {item.isRead ? "new" : "read"}
                </button>
              </form>
              <ConfirmDeleteButton
                action={deleteFeedbackAction.bind(
                  null,
                  item.id,
                )}
                label="Delete"
                confirmText={`Delete the feedback from ${item.email}?`}
              />
            </div>
          </li>
        ))}
      </ul>
      <Pagination
        page={feedback.page}
        pageCount={feedback.pageCount}
        basePath={ADMIN_PATHS.feedback}
      />
    </>
  )
}
