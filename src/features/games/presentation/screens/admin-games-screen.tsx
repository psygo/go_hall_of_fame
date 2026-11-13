import type { QueryParam } from "@/core/list-query"
import Link from "next/link"

import { gamesAdminState } from "@/config/di"
import {
  AdminList,
  AdminListRow,
} from "@/shared/ui/presentation/admin-section"
import { ConfirmDeleteButton } from "@/shared/ui/presentation/confirm-delete-button"
import { Pagination } from "@/shared/ui/presentation/pagination"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { deleteGameAction } from "../state/games-admin-actions"

export async function AdminGamesScreen({
  searchParams,
}: {
  readonly searchParams: Promise<{
    readonly page?: QueryParam
  }>
}) {
  const { page: pageParam } = await searchParams
  const games =
    await gamesAdminState.loadAdminGames(pageParam)

  return (
    <>
      <PageHeader eyebrow="Admin" title="Games">
        <Link
          href="/admin/games/new"
          className="btn btn-primary mt-6"
        >
          New game
        </Link>
      </PageHeader>
      <AdminList>
        {games.items.map((game) => (
          <AdminListRow key={game.slug}>
            <div>
              <span className="text-accent mr-3 font-bold">
                {game.year}
              </span>
              <span className="font-bold">{game.name}</span>
              {game.isDraft && (
                <span className="tag tag-outline ml-3">
                  Draft
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/games/${game.slug}`}
                className="btn btn-ghost"
              >
                View
              </Link>
              <Link
                href={`/admin/games/${game.slug}`}
                className="btn btn-secondary"
              >
                Edit
              </Link>
              <ConfirmDeleteButton
                action={deleteGameAction.bind(
                  null,
                  game.slug,
                )}
                label="Delete"
                confirmText={`Delete “${game.name}”?`}
              />
            </div>
          </AdminListRow>
        ))}
      </AdminList>
      <Pagination
        page={games.page}
        pageCount={games.pageCount}
        basePath="/admin/games"
      />
    </>
  )
}
