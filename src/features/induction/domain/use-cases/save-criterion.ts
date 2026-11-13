import type { UseCase } from "@/core/use-case"
import type { SaveResult } from "@/core/validation"

import {
  validateCriterionForm,
  type CriterionErrors,
} from "../entities/criterion-draft"
import type { SaveCriterionParams } from "../params/save-criterion-params"
import type { CriteriaRepository } from "../repositories/criteria-repository"

export class SaveCriterion implements UseCase<
  SaveCriterionParams,
  SaveResult<CriterionErrors>
> {
  constructor(
    private readonly criteria: CriteriaRepository,
  ) {}

  async call({
    id,
    form,
  }: SaveCriterionParams): Promise<
    SaveResult<CriterionErrors>
  > {
    const existing = await this.criteria.listAll()
    if (existing.status === "failure") {
      return { status: "failed", error: existing.error }
    }
    const validation = validateCriterionForm(form, {
      existing: existing.data,
      editingId: id,
    })
    if (!validation.valid) {
      return {
        status: "invalid",
        errors: validation.errors,
      }
    }
    const saved = await this.criteria.save(
      validation.draft,
      id,
    )
    return saved.status === "failure"
      ? { status: "failed", error: saved.error }
      : { status: "saved" }
  }
}
