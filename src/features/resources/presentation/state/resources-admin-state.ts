import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { connection } from "next/server"

import type { AdminFormState } from "@/core/admin-form-state"
import type { RequireAdmin } from "@/core/admin-guard"
import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import type { ResourceLink } from "@/core/resources"
import type { NoParams, UseCase } from "@/core/use-case"
import type { SaveResult } from "@/core/validation"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"
import { readResourceRows } from "@/shared/ui/presentation/form-data"

import type {
  SiteResourcesErrors,
  SiteResourcesForm,
} from "../../domain/entities/site-resources"
import type { SaveSiteResourcesParams } from "../../domain/params/save-site-resources-params"

export type ResourcesFormState = AdminFormState<
  SiteResourcesForm,
  SiteResourcesErrors
>

export const RESOURCES_ADMIN_PATH = ADMIN_PATHS.resources

export type ResourcesAdminDependencies = {
  readonly requireAdmin: RequireAdmin
  readonly listSiteResources: UseCase<
    NoParams,
    DataState<readonly ResourceLink[]>
  >
  readonly saveSiteResources: UseCase<
    SaveSiteResourcesParams,
    SaveResult<SiteResourcesErrors>
  >
}

export function createResourcesAdminState(
  dependencies: ResourcesAdminDependencies,
) {
  async function loadEditor(): Promise<
    readonly ResourceLink[]
  > {
    await connection()
    await dependencies.requireAdmin()
    return unwrapDataState(
      await dependencies.listSiteResources.call({}),
    )
  }

  async function saveFromForm(
    formData: FormData,
  ): Promise<ResourcesFormState> {
    await dependencies.requireAdmin()
    const form: SiteResourcesForm = {
      resources: readResourceRows(formData),
    }
    const result =
      await dependencies.saveSiteResources.call({
        form,
      })
    if (result.status === "saved") {
      revalidatePath("/", "layout")
      redirect(RESOURCES_ADMIN_PATH)
    }
    if (result.status === "invalid") {
      return {
        status: "invalid",
        errors: result.errors,
        values: form,
      }
    }
    console.error(
      "Could not save the resources:",
      result.error.name,
    )
    return {
      status: "failed",
      message:
        "The resources could not be saved. Try again in a moment.",
      values: form,
    }
  }

  return { loadEditor, saveFromForm }
}
