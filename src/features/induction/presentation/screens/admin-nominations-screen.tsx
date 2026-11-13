import { inductionAdminState } from "@/config/di"
import { ConfirmDeleteButton } from "@/shared/ui/presentation/confirm-delete-button"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import {
  NOMINATION_STATUSES,
  type NominationStatus,
} from "../../domain/entities/nomination-record"
import {
  deleteNominationAction,
  setNominationStatusAction,
} from "../state/induction-admin-actions"

const STATUS_LABEL: Readonly<
  Record<NominationStatus, string>
> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
}

export async function AdminNominationsScreen() {
  const nominations =
    await inductionAdminState.loadNominations()

  return (
    <>
      <PageHeader eyebrow="Admin" title="Nominations" />
      {nominations.length === 0 && (
        <p className="px-4 py-10">No nominations yet.</p>
      )}
      <ul className="m-0 list-none p-0">
        {nominations.map((nomination) => (
          <li
            key={nomination.id}
            className="border-divider flex flex-col gap-3 border-b px-4 py-5"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-lg font-bold">
                {nomination.name}
              </span>
              <span className="tag tag-outline">
                {nomination.category === "player"
                  ? "Player"
                  : "Game"}
              </span>
              <span
                className={`tag ${nomination.status === "pending" ? "tag-accent" : ""}`}
              >
                {STATUS_LABEL[nomination.status]}
              </span>
              <span className="text-xs opacity-70">
                {nomination.createdAt
                  .toISOString()
                  .slice(0, 10)}
              </span>
            </div>
            <div className="text-sm">
              <a href={`mailto:${nomination.email}`}>
                {nomination.email}
              </a>
            </div>
            {nomination.caseForInduction !== "" && (
              <p className="max-w-[70ch] whitespace-pre-line">
                {nomination.caseForInduction}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {NOMINATION_STATUSES.filter(
                (status) => status !== nomination.status,
              ).map((status) => (
                <form
                  key={status}
                  action={setNominationStatusAction.bind(
                    null,
                    nomination.id,
                    status,
                  )}
                >
                  <button
                    type="submit"
                    className="btn btn-secondary"
                  >
                    Mark{" "}
                    {STATUS_LABEL[status].toLowerCase()}
                  </button>
                </form>
              ))}
              <ConfirmDeleteButton
                action={deleteNominationAction.bind(
                  null,
                  nomination.id,
                )}
                label="Delete"
                confirmText={`Delete the nomination of ${nomination.name}?`}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
