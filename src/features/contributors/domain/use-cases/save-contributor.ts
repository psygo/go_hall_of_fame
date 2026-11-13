import type { UseCase } from "@/core/use-case"
import type { SaveResult } from "@/core/validation"

import {
  validateContributorForm,
  type ContributorErrors,
} from "../entities/contributor-draft"
import type { SaveContributorParams } from "../params/save-contributor-params"
import type { ContributorsRepository } from "../repositories/contributors-repository"

export class SaveContributor implements UseCase<
  SaveContributorParams,
  SaveResult<ContributorErrors>
> {
  constructor(
    private readonly contributors: ContributorsRepository,
  ) {}

  async call({
    originalSlug,
    form,
  }: SaveContributorParams): Promise<
    SaveResult<ContributorErrors>
  > {
    const existing = await this.contributors.listAll()
    if (existing.status === "failure") {
      return { status: "failed", error: existing.error }
    }
    const validation = validateContributorForm(form, {
      existing: existing.data,
      originalSlug,
    })
    if (!validation.valid) {
      return {
        status: "invalid",
        errors: validation.errors,
      }
    }
    const saved = await this.contributors.save(
      validation.draft,
      originalSlug,
    )
    return saved.status === "failure"
      ? { status: "failed", error: saved.error }
      : { status: "saved" }
  }
}
