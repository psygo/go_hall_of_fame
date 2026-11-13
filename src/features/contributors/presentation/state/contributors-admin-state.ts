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
} from "@/shared/ui/presentation/form-data"

import type { Contributor } from "../../domain/entities/contributor"
import type {
  ContributorErrors,
  ContributorForm,
} from "../../domain/entities/contributor-draft"
import type { ContributorSlugParams } from "../../domain/params/contributor-slug-params"
import type { SaveContributorParams } from "../../domain/params/save-contributor-params"

export type ContributorFormState = AdminFormState<
  ContributorForm,
  ContributorErrors
>

const CONTRIBUTORS_ADMIN_PATH = ADMIN_PATHS.contributors

export type ContributorsAdminDependencies = {
  readonly requireAdmin: RequireAdmin
  readonly listContributors: UseCase<
    NoParams,
    DataState<readonly Contributor[]>
  >
  readonly getContributor: UseCase<
    ContributorSlugParams,
    DataState<Contributor | null>
  >
  readonly saveContributor: UseCase<
    SaveContributorParams,
    SaveResult<ContributorErrors>
  >
  readonly deleteContributor: UseCase<
    ContributorSlugParams,
    DataState<void>
  >
}

export function createContributorsAdminState(
  dependencies: ContributorsAdminDependencies,
) {
  async function loadAdminContributors(): Promise<
    readonly Contributor[]
  > {
    await connection()
    await dependencies.requireAdmin()
    return unwrapDataState(
      await dependencies.listContributors.call({}),
    )
  }

  /** "new" gives null (a blank form); an unknown slug is a 404. */
  async function loadEditor(
    slugParam: string,
  ): Promise<Contributor | null> {
    await connection()
    await dependencies.requireAdmin()
    if (slugParam === "new") return null
    const contributor = unwrapDataState(
      await dependencies.getContributor.call({
        slug: slugParam,
      }),
    )
    if (contributor === null) notFound()
    return contributor
  }

  async function saveFromForm(
    slugParam: string,
    formData: FormData,
  ): Promise<ContributorFormState> {
    await dependencies.requireAdmin()
    const form = readContributorForm(formData)
    const result = await dependencies.saveContributor.call({
      originalSlug: slugParam === "new" ? null : slugParam,
      form,
    })
    if (result.status === "saved") {
      revalidatePath("/", "layout")
      redirect(CONTRIBUTORS_ADMIN_PATH)
    }
    if (result.status === "invalid") {
      return {
        status: "invalid",
        errors: result.errors,
        values: form,
      }
    }
    console.error(
      "Could not save the contributor:",
      result.error.name,
    )
    return {
      status: "failed",
      message:
        "The contributor could not be saved. Try again in a moment.",
      values: form,
    }
  }

  async function deleteBySlug(slug: string): Promise<void> {
    await dependencies.requireAdmin()
    const deleted =
      await dependencies.deleteContributor.call({
        slug,
      })
    if (deleted.status === "failure") {
      console.error(
        "Could not delete the contributor:",
        deleted.error.name,
      )
      throw new Error("The change could not be saved.")
    }
    revalidatePath("/", "layout")
    redirect(CONTRIBUTORS_ADMIN_PATH)
  }

  return {
    loadAdminContributors,
    loadEditor,
    saveFromForm,
    deleteBySlug,
  }
}

function readContributorForm(
  formData: FormData,
): ContributorForm {
  return {
    slug: readFormText(formData, "slug"),
    name: readFormText(formData, "name"),
    kind: readFormText(formData, "kind"),
    birthYear: readFormText(formData, "birthYear"),
    role: readFormText(formData, "role"),
    period: readFormText(formData, "period"),
    bio: readFormText(formData, "bio"),
    photoUrl: readFormText(formData, "photoUrl"),
    photoPosition: readFormText(formData, "photoPosition"),
    isDraft: readFormFlag(formData, "isDraft"),
  }
}
