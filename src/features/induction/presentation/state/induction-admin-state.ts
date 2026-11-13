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
import type { NoParams, UseCase } from "@/core/use-case"
import {
  parseInteger,
  type SaveResult,
} from "@/core/validation"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"
import { readFormText } from "@/shared/ui/presentation/form-data"

import type { Criterion } from "../../domain/entities/criterion"
import type {
  CriterionErrors,
  CriterionForm,
} from "../../domain/entities/criterion-draft"
import {
  isNominationStatus,
  type NominationRecord,
} from "../../domain/entities/nomination-record"
import type { IdParams } from "../../domain/params/id-params"
import type { SaveCriterionParams } from "../../domain/params/save-criterion-params"
import type { SetNominationStatusParams } from "../../domain/params/set-nomination-status-params"

export type CriterionFormState = AdminFormState<
  CriterionForm,
  CriterionErrors
>

export const CRITERIA_ADMIN_PATH = ADMIN_PATHS.criteria
export const NOMINATIONS_ADMIN_PATH =
  ADMIN_PATHS.nominations

export type InductionAdminDependencies = {
  readonly requireAdmin: RequireAdmin
  readonly listCriteria: UseCase<
    NoParams,
    DataState<readonly Criterion[]>
  >
  readonly getCriterion: UseCase<
    IdParams,
    DataState<Criterion | null>
  >
  readonly saveCriterion: UseCase<
    SaveCriterionParams,
    SaveResult<CriterionErrors>
  >
  readonly deleteCriterion: UseCase<
    IdParams,
    DataState<void>
  >
  readonly listNominations: UseCase<
    NoParams,
    DataState<readonly NominationRecord[]>
  >
  readonly setNominationStatus: UseCase<
    SetNominationStatusParams,
    DataState<void>
  >
  readonly deleteNomination: UseCase<
    IdParams,
    DataState<void>
  >
}

export function createInductionAdminState(
  dependencies: InductionAdminDependencies,
) {
  async function loadAdminCriteria(
    pageParam?: QueryParam,
  ): Promise<Page<Criterion>> {
    await connection()
    await dependencies.requireAdmin()
    const all = unwrapDataState(
      await dependencies.listCriteria.call({}),
    )
    return paginate(
      all,
      readPageParam(pageParam),
      ADMIN_PAGE_SIZE,
    )
  }

  /** "new" gives null (a blank form); an unknown id is a 404. */
  async function loadCriterionEditor(
    idParam: string,
  ): Promise<Criterion | null> {
    await connection()
    await dependencies.requireAdmin()
    if (idParam === "new") return null
    const id = parseInteger(idParam)
    if (id === null) notFound()
    const criterion = unwrapDataState(
      await dependencies.getCriterion.call({ id }),
    )
    if (criterion === null) notFound()
    return criterion
  }

  async function saveCriterionFromForm(
    idParam: string,
    formData: FormData,
  ): Promise<CriterionFormState> {
    await dependencies.requireAdmin()
    const form: CriterionForm = {
      position: readFormText(formData, "position"),
      title: readFormText(formData, "title"),
      text: readFormText(formData, "text"),
    }
    const id =
      idParam === "new" ? null : parseInteger(idParam)
    if (idParam !== "new" && id === null) notFound()
    const result = await dependencies.saveCriterion.call({
      id,
      form,
    })
    if (result.status === "saved") {
      revalidatePath("/", "layout")
      redirect(CRITERIA_ADMIN_PATH)
    }
    if (result.status === "invalid") {
      return {
        status: "invalid",
        errors: result.errors,
        values: form,
      }
    }
    console.error(
      "Could not save the criterion:",
      result.error.name,
    )
    return {
      status: "failed",
      message:
        "The criterion could not be saved. Try again in a moment.",
      values: form,
    }
  }

  async function deleteCriterionById(
    id: number,
  ): Promise<void> {
    await dependencies.requireAdmin()
    const deleted = await dependencies.deleteCriterion.call(
      { id },
    )
    if (deleted.status === "failure") {
      console.error(
        "Could not delete the criterion:",
        deleted.error.name,
      )
      throw new Error("The change could not be saved.")
    }
    revalidatePath("/", "layout")
    redirect(CRITERIA_ADMIN_PATH)
  }

  async function loadNominations(
    pageParam?: QueryParam,
  ): Promise<Page<NominationRecord>> {
    await connection()
    await dependencies.requireAdmin()
    const all = unwrapDataState(
      await dependencies.listNominations.call({}),
    )
    return paginate(
      all,
      readPageParam(pageParam),
      ADMIN_PAGE_SIZE,
    )
  }

  async function setNominationStatus(
    id: number,
    statusParam: string,
  ): Promise<void> {
    await dependencies.requireAdmin()
    if (!isNominationStatus(statusParam))
      throw new Error("Unknown status")
    const updated =
      await dependencies.setNominationStatus.call({
        id,
        status: statusParam,
      })
    if (updated.status === "failure") {
      console.error(
        "Could not update the nomination:",
        updated.error.name,
      )
      throw new Error("The change could not be saved.")
    }
    revalidatePath(NOMINATIONS_ADMIN_PATH)
    redirect(NOMINATIONS_ADMIN_PATH)
  }

  async function deleteNominationById(
    id: number,
  ): Promise<void> {
    await dependencies.requireAdmin()
    const deleted =
      await dependencies.deleteNomination.call({ id })
    if (deleted.status === "failure") {
      console.error(
        "Could not delete the nomination:",
        deleted.error.name,
      )
      throw new Error("The change could not be saved.")
    }
    revalidatePath(NOMINATIONS_ADMIN_PATH)
    redirect(NOMINATIONS_ADMIN_PATH)
  }

  return {
    loadAdminCriteria,
    loadCriterionEditor,
    saveCriterionFromForm,
    deleteCriterionById,
    loadNominations,
    setNominationStatus,
    deleteNominationById,
  }
}
