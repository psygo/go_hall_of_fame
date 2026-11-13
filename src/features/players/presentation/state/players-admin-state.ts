import { revalidatePath } from "next/cache"
import { notFound, redirect } from "next/navigation"
import { connection } from "next/server"

import type { AdminFormState } from "@/core/admin-form-state"
import type { RequireAdmin } from "@/core/admin-guard"
import {
  ADMIN_PAGE_SIZE,
  paginate,
  readPageParam,
  type Page,
  type QueryParam,
} from "@/core/list-query"
import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import type { UseCase } from "@/core/use-case"
import type { SaveResult } from "@/core/validation"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"
import {
  readFormFlag,
  readFormText,
  readResourceRows,
} from "@/shared/ui/presentation/form-data"

import type {
  Player,
  PlayerDetail,
} from "../../domain/entities/player"
import type {
  PlayerErrors,
  PlayerForm,
} from "../../domain/entities/player-draft"
import type { GetPlayerDetailParams } from "../../domain/params/get-player-detail-params"
import type { ListPlayersParams } from "../../domain/params/list-players-params"
import type { SavePlayerParams } from "../../domain/params/save-player-params"

export type PlayerFormState = AdminFormState<
  PlayerForm,
  PlayerErrors
>

export const PLAYERS_ADMIN_PATH = ADMIN_PATHS.players

export type PlayersAdminDependencies = {
  readonly requireAdmin: RequireAdmin
  readonly listPlayers: UseCase<
    ListPlayersParams,
    DataState<readonly Player[]>
  >
  readonly getPlayerDetail: UseCase<
    GetPlayerDetailParams,
    DataState<PlayerDetail | null>
  >
  readonly savePlayer: UseCase<
    SavePlayerParams,
    SaveResult<PlayerErrors>
  >
  readonly deletePlayer: UseCase<
    GetPlayerDetailParams,
    DataState<void>
  >
}

export function createPlayersAdminState(
  dependencies: PlayersAdminDependencies,
) {
  async function loadAdminPlayers(
    pageParam?: QueryParam,
  ): Promise<Page<Player>> {
    await connection()
    await dependencies.requireAdmin()
    const all = unwrapDataState(
      await dependencies.listPlayers.call({
        country: null,
      }),
    )
    return paginate(
      all,
      readPageParam(pageParam),
      ADMIN_PAGE_SIZE,
    )
  }

  /** "new" gives null (a blank form); an unknown slug is a 404. */
  async function loadEditor(
    slugParam: string,
  ): Promise<PlayerDetail | null> {
    await connection()
    await dependencies.requireAdmin()
    if (slugParam === "new") return null
    const detail = unwrapDataState(
      await dependencies.getPlayerDetail.call({
        slug: slugParam,
      }),
    )
    if (detail === null) notFound()
    return detail
  }

  async function saveFromForm(
    slugParam: string,
    formData: FormData,
  ): Promise<PlayerFormState> {
    await dependencies.requireAdmin()
    const form = readPlayerForm(formData)
    const result = await dependencies.savePlayer.call({
      originalSlug: slugParam === "new" ? null : slugParam,
      form,
    })
    if (result.status === "saved") {
      revalidatePath("/", "layout")
      redirect(PLAYERS_ADMIN_PATH)
    }
    if (result.status === "invalid") {
      return {
        status: "invalid",
        errors: result.errors,
        values: form,
      }
    }
    console.error(
      "Could not save the player:",
      result.error.name,
    )
    return {
      status: "failed",
      message:
        "The player could not be saved. Try again in a moment.",
      values: form,
    }
  }

  async function deleteBySlug(slug: string): Promise<void> {
    await dependencies.requireAdmin()
    const deleted = await dependencies.deletePlayer.call({
      slug,
    })
    if (deleted.status === "failure") {
      console.error(
        "Could not delete the player:",
        deleted.error.name,
      )
      throw new Error("The change could not be saved.")
    }
    revalidatePath("/", "layout")
    redirect(PLAYERS_ADMIN_PATH)
  }

  return {
    loadAdminPlayers,
    loadEditor,
    saveFromForm,
    deleteBySlug,
  }
}

function readPlayerForm(formData: FormData): PlayerForm {
  return {
    slug: readFormText(formData, "slug"),
    name: readFormText(formData, "name"),
    nativeName: readFormText(formData, "nativeName"),
    country: readFormText(formData, "country"),
    years: readFormText(formData, "years"),
    distinction: readFormText(formData, "distinction"),
    bio: readFormText(formData, "bio"),
    photoUrl: readFormText(formData, "photoUrl"),
    photoPosition: readFormText(formData, "photoPosition"),
    inductionNumber: readFormText(
      formData,
      "inductionNumber",
    ),
    tags: readFormText(formData, "tags"),
    isDraft: readFormFlag(formData, "isDraft"),
    resources: readResourceRows(formData),
  }
}
