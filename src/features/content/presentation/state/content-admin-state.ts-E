import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { connection } from "next/server"

import type { AdminFormState } from "@/core/admin-form-state"
import type { RequireAdmin } from "@/core/admin-guard"
import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"
import type {
  FieldErrors,
  SaveResult,
} from "@/core/validation"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"
import { readFormText } from "@/shared/ui/presentation/form-data"

import {
  PAGE_TEXT_DEFINITIONS,
  type EditableText,
} from "../../domain/entities/page-text"
import type { SaveSiteTextsParams } from "../../domain/params/save-site-texts-params"

export type SiteTextsFormState = AdminFormState<
  Readonly<Record<string, string>>,
  FieldErrors
>

export const PAGES_ADMIN_PATH = ADMIN_PATHS.pages
export const PAGES_SAVED_PATH = `${PAGES_ADMIN_PATH}?saved=1`

export type ContentAdminDependencies = {
  readonly requireAdmin: RequireAdmin
  readonly listEditableTexts: UseCase<
    NoParams,
    DataState<readonly EditableText[]>
  >
  readonly saveSiteTexts: UseCase<
    SaveSiteTextsParams,
    SaveResult<FieldErrors>
  >
}

export function createContentAdminState(
  dependencies: ContentAdminDependencies,
) {
  async function loadEditableTexts(): Promise<
    readonly EditableText[]
  > {
    await connection()
    await dependencies.requireAdmin()
    return unwrapDataState(
      await dependencies.listEditableTexts.call({}),
    )
  }

  async function saveFromForm(
    formData: FormData,
  ): Promise<SiteTextsFormState> {
    await dependencies.requireAdmin()
    const form = Object.fromEntries(
      PAGE_TEXT_DEFINITIONS.map(({ key }) => [
        key,
        readFormText(formData, key),
      ]),
    )
    const result = await dependencies.saveSiteTexts.call({
      form,
    })
    if (result.status === "saved") {
      revalidatePath("/", "layout")
      redirect(PAGES_SAVED_PATH)
    }
    if (result.status === "invalid") {
      return {
        status: "invalid",
        errors: result.errors,
        values: form,
      }
    }
    console.error(
      "Could not save the page texts:",
      result.error.name,
    )
    return {
      status: "failed",
      message:
        "The texts could not be saved. Try again in a moment.",
      values: form,
    }
  }

  return { loadEditableTexts, saveFromForm }
}
