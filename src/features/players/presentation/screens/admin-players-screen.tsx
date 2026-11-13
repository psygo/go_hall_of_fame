import Link from "next/link"

import { playersAdminState } from "@/config/di"
import {
  AdminList,
  AdminListRow,
} from "@/shared/ui/presentation/admin-section"
import { ConfirmDeleteButton } from "@/shared/ui/presentation/confirm-delete-button"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { deletePlayerAction } from "../state/players-admin-actions"

export async function AdminPlayersScreen() {
  const players = await playersAdminState.loadAdminPlayers()

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
        {players.map((player) => (
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
    </>
  )
}
