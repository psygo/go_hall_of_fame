import type { ContributorForm } from "../entities/contributor-draft"

export type SaveContributorParams = {
  /** Null creates a new contributor. */
  readonly originalSlug: string | null
  readonly form: ContributorForm
}
