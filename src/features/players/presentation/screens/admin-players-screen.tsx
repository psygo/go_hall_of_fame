import type { QueryParam } from "@/core/list-query"
import Link from "next/link"

import { playersAdminState } from "@/config/di"
import {
  AdminList,
  AdminListRow,
} from "@/shared/ui/presentation/admin-section"
import { ConfirmDeleteButton } from "@/shared/ui/presentation/confirm-delete-button"
import { Pagination } from "@/shared/ui/presentation/pagination"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { deletePlayerAction } from "../state/players-admin-actions"

export async function AdminPlayersScreen({
  searchParams,
}: {
  readonly searchParams: Promise<{
    readonly page?: QueryParam
  }>
}) {
  const { page: pageParam } = await searchParams
  const players =
    await playersAdminState.loadAdminPlayers(pageParam)

  return (
    <>
      <PageHeader eyebrow="Admin" title="Players">
        <Link
          href="/admin/players/new"
          className="btn btn-primary mt-6"
        >
          New player
        </Link>
      </PageHeader>
      <AdminList>
        {players.items.map((player) => (
          <AdminListRow key={player.slug}>
            <div>
              <span className="text-accent-700 mr-3 text-xs font-bold">
                No.{" "}
                {String(player.inductionNumber).padStart(
                  2,
                  "0",
                )}
              </span>
              <span className="font-bold">
                {player.name}
              </span>
              {player.isDraft && (
                <span className="tag tag-outline ml-3">
                  Draft
                </span>
              )}
              <span className="ml-3 text-sm opacity-70">
                {player.country}
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/players/${player.slug}`}
                className="btn btn-ghost"
              >
                View
              </Link>
              <Link
                href={`/admin/players/${player.slug}`}
                className="btn btn-secondary"
              >
                Edit
              </Link>
              <ConfirmDeleteButton
                action={deletePlayerAction.bind(
                  null,
                  player.slug,
                )}
                label="Delete"
                confirmText={`Delete ${player.name} from the Hall? Their games stay.`}
              />
            </div>
          </AdminListRow>
        ))}
      </AdminList>
      <Pagination
        page={players.page}
        pageCount={players.pageCount}
        basePath="/admin/players"
      />
    </>
  )
}
