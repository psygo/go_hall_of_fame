import { revalidatePath } from "next/cache"
import { notFound, redirect } from "next/navigation"
import { connection } from "next/server"

import type { AdminFormState } from "@/core/admin-form-state"
import type { RequireAdmin } from "@/core/admin-guard"
import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"
import type { SaveResult } from "@/core/validation"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"
import {
  readFormFlag,
  readFormText,
  readFormTexts,
} from "@/shared/ui/presentation/form-data"

import type {
  Game,
  GameDetail,
  GamePlayerReference,
} from "../../domain/entities/game"
import type {
  GameErrors,
  GameForm,
} from "../../domain/entities/game-draft"
import type { GameSlugParams } from "../../domain/params/game-slug-params"
import type { SaveGameParams } from "../../domain/params/save-game-params"

export type GameFormState = AdminFormState<
  GameForm,
  GameErrors
>

export const GAMES_ADMIN_PATH = ADMIN_PATHS.games

export type GameEditor = {
  /** Null for a new game. */
  readonly game: GameDetail | null
  readonly playerOptions: readonly GamePlayerReference[]
}

export type GamesAdminDependencies = {
  readonly requireAdmin: RequireAdmin
  readonly listGames: UseCase<
    NoParams,
    DataState<readonly Game[]>
  >
  readonly getGameDetail: UseCase<
    GameSlugParams,
    DataState<GameDetail | null>
  >
  readonly listGamePlayerOptions: UseCase<
    NoParams,
    DataState<readonly GamePlayerReference[]>
  >
  readonly saveGame: UseCase<
    SaveGameParams,
    SaveResult<GameErrors>
  >
  readonly deleteGame: UseCase<
    GameSlugParams,
    DataState<void>
  >
}

export function createGamesAdminState(
  dependencies: GamesAdminDependencies,
) {
  async function loadAdminGames(): Promise<
    readonly Game[]
  > {
    await connection()
    await dependencies.requireAdmin()
    return unwrapDataState(
      await dependencies.listGames.call({}),
    )
  }

  /** "new" gives a blank editor; an unknown slug is a 404. */
  async function loadEditor(
    slugParam: string,
  ): Promise<GameEditor> {
    await connection()
    await dependencies.requireAdmin()
    const playerOptions = unwrapDataState(
      await dependencies.listGamePlayerOptions.call({}),
    )
    if (slugParam === "new")
      return { game: null, playerOptions }
    const game = unwrapDataState(
      await dependencies.getGameDetail.call({
        slug: slugParam,
      }),
    )
    if (game === null) notFound()
    return { game, playerOptions }
  }

  async function saveFromForm(
    slugParam: string,
    formData: FormData,
  ): Promise<GameFormState> {
    await dependencies.requireAdmin()
    const form = readGameForm(formData)
    const result = await dependencies.saveGame.call({
      originalSlug: slugParam === "new" ? null : slugParam,
      form,
    })
    if (result.status === "saved") {
      revalidatePath("/", "layout")
      redirect(GAMES_ADMIN_PATH)
    }
    if (result.status === "invalid") {
      return {
        status: "invalid",
        errors: result.errors,
        values: form,
      }
    }
    console.error(
      "Could not save the game:",
      result.error.name,
    )
    return {
      status: "failed",
      message:
        "The game could not be saved. Try again in a moment.",
      values: form,
    }
  }

  async function deleteBySlug(slug: string): Promise<void> {
    await dependencies.requireAdmin()
    const deleted = await dependencies.deleteGame.call({
      slug,
    })
    if (deleted.status === "failure") {
      console.error(
        "Could not delete the game:",
        deleted.error.name,
      )
      throw deleted.error
    }
    revalidatePath("/", "layout")
    redirect(GAMES_ADMIN_PATH)
  }

  return {
    loadAdminGames,
    loadEditor,
    saveFromForm,
    deleteBySlug,
  }
}

function readGameForm(formData: FormData): GameForm {
  return {
    slug: readFormText(formData, "slug"),
    year: readFormText(formData, "year"),
    name: readFormText(formData, "name"),
    black: readFormText(formData, "black"),
    white: readFormText(formData, "white"),
    result: readFormText(formData, "result"),
    setting: readFormText(formData, "setting"),
    hook: readFormText(formData, "hook"),
    moment: readFormText(formData, "moment"),
    legacy: readFormText(formData, "legacy"),
    sgfUrl: readFormText(formData, "sgfUrl"),
    sequence: readFormText(formData, "sequence"),
    featured: readFormFlag(formData, "featured"),
    playerSlugs: readFormTexts(formData, "playerSlugs"),
  }
}
