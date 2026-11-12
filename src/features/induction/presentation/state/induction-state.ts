import { connection } from "next/server"

import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import type { Criterion } from "../../domain/entities/criterion"
import {
  isNominationCategory,
  type NominationSubmission,
} from "../../domain/entities/nomination"
import type { SubmitNominationParams } from "../../domain/params/submit-nomination-params"
import type {
  NominationFormState,
  NominationFormValues,
} from "./nomination-form-state"

export type InductionDependencies = {
  readonly listCriteria: UseCase<
    NoParams,
    DataState<readonly Criterion[]>
  >
  readonly submitNomination: UseCase<
    SubmitNominationParams,
    NominationSubmission
  >
}

export function createInductionState(
  dependencies: InductionDependencies,
) {
  async function loadCriteria(): Promise<
    readonly Criterion[]
  > {
    await connection()
    return unwrapDataState(
      await dependencies.listCriteria.call({}),
    )
  }

  async function submitNominationForm(
    formData: FormData,
  ): Promise<NominationFormState> {
    const values = readFormValues(formData)
    const submission =
      await dependencies.submitNomination.call({
        draft: values,
      })
    if (submission.status === "accepted") {
      const { name, email } = submission.draft
      return { status: "accepted", name, email }
    }
    if (submission.status === "invalid") {
      return {
        status: "invalid",
        errors: submission.errors,
        values,
      }
    }
    // Only the name: a driver error message can contain the submitted email.
    console.error(
      "Nomination could not be saved:",
      submission.error.name,
    )
    return { status: "failed", values }
  }

  return { loadCriteria, submitNominationForm }
}

function readFormValues(
  formData: FormData,
): NominationFormValues {
  const category = formData.get("category")
  return {
    name: readText(formData, "name"),
    category: isNominationCategory(category)
      ? category
      : "player",
    email: readText(formData, "email"),
    caseForInduction: readText(
      formData,
      "caseForInduction",
    ),
  }
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}
