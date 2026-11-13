import type { CriterionForm } from "../entities/criterion-draft"

export type SaveCriterionParams = {
  /** Null creates a new criterion. */
  readonly id: number | null
  readonly form: CriterionForm
}
