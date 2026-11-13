import { connection } from "next/server"

import {
  unwrapDataState,
  type DataState,
} from "@/core/data-state"
import {
  readChoice,
  readPageParam,
  type Page,
  type QueryParam,
} from "@/core/list-query"
import type { UseCase } from "@/core/use-case"

import {
  CRITERIA_ORDERS,
  type CriteriaOrder,
  type Criterion,
} from "../../domain/entities/criterion"
import type { PageCriteriaParams } from "../../domain/params/page-criteria-params"
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
  readonly pageCriteria: UseCase<
    PageCriteriaParams,
    DataState<Page<Criterion>>
  >
  readonly submitNomination: UseCase<
    SubmitNominationParams,
    NominationSubmission
  >
}

export type CriteriaSearchParams = {
  readonly sort?: QueryParam
  readonly page?: QueryParam
}

export type CriteriaPageState = {
  readonly criteria: Page<Criterion>
  readonly order: CriteriaOrder
}

export function createInductionState(
  dependencies: InductionDependencies,
) {
  async function loadCriteriaPage(
    params: CriteriaSearchParams,
  ): Promise<CriteriaPageState> {
    await connection()
    const order = readChoice(
      params.sort,
      CRITERIA_ORDERS,
      "first",
    )
    const criteria = unwrapDataState(
      await dependencies.pageCriteria.call({
        order,
        page: readPageParam(params.page),
      }),
    )
    return { criteria, order }
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

  return { loadCriteriaPage, submitNominationForm }
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
