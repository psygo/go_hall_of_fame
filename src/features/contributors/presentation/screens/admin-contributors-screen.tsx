import Link from "next/link"

import { contributorsAdminState } from "@/config/di"
import {
  AdminList,
  AdminListRow,
} from "@/shared/ui/presentation/admin-section"
import { ConfirmDeleteButton } from "@/shared/ui/presentation/confirm-delete-button"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { CONTRIBUTOR_KIND_LABELS } from "../../domain/entities/contributor"
import { deleteContributorAction } from "../state/contributors-admin-actions"

export async function AdminContributorsScreen() {
  const contributors =
    await contributorsAdminState.loadAdminContributors()

  return (
    <>
      <PageHeader eyebrow="Admin" title="Game contributors">
        <Link
          href="/admin/contributors/new"
          className="btn btn-primary mt-6"
        >
          New contributor
        </Link>
      </PageHeader>
      <AdminList>
        {contributors.map((contributor) => (
          <AdminListRow key={contributor.slug}>
            <div>
              <span className="font-bold">
                {contributor.name}
              </span>
              {contributor.isDraft && (
                <span className="tag tag-outline ml-3">
                  Draft
                </span>
              )}
              <span className="ml-3 text-sm opacity-70">
                {CONTRIBUTOR_KIND_LABELS[contributor.kind]}
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/contributors/${contributor.slug}`}
                className="btn btn-ghost"
              >
                View
              </Link>
              <Link
                href={`/admin/contributors/${contributor.slug}`}
                className="btn btn-secondary"
              >
                Edit
              </Link>
              <ConfirmDeleteButton
                action={deleteContributorAction.bind(
                  null,
                  contributor.slug,
                )}
                label="Delete"
                confirmText={`Delete ${contributor.name}? Timeline events keep their text but lose the link.`}
              />
            </div>
          </AdminListRow>
        ))}
      </AdminList>
    </>
  )
}
