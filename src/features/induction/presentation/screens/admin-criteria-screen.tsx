import Link from "next/link"

import { inductionAdminState } from "@/config/di"
import {
  AdminList,
  AdminListRow,
} from "@/shared/ui/presentation/admin-section"
import { ConfirmDeleteButton } from "@/shared/ui/presentation/confirm-delete-button"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { deleteCriterionAction } from "../state/induction-admin-actions"

export async function AdminCriteriaScreen() {
  const criteria =
    await inductionAdminState.loadAdminCriteria()

  return (
    <>
      <PageHeader eyebrow="Admin" title="Criteria">
        <Link
          href="/admin/criteria/new"
          className="btn btn-primary mt-6"
        >
          New criterion
        </Link>
      </PageHeader>
      <AdminList>
        {criteria.map((criterion) => (
          <AdminListRow key={criterion.id}>
            <div>
              <span className="text-accent mr-3 font-bold">
                {String(criterion.position).padStart(
                  2,
                  "0",
                )}
              </span>
              <span className="font-bold">
                {criterion.title}
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/criteria/${criterion.id}`}
                className="btn btn-secondary"
              >
                Edit
              </Link>
              <ConfirmDeleteButton
                action={deleteCriterionAction.bind(
                  null,
                  criterion.id,
                )}
                label="Delete"
                confirmText={`Delete the criterion “${criterion.title}”?`}
              />
            </div>
          </AdminListRow>
        ))}
      </AdminList>
    </>
  )
}
