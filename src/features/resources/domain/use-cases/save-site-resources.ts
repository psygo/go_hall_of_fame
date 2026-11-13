import type { SaveResult } from "@/core/validation"
import type { UseCase } from "@/core/use-case"

import {
  validateSiteResourcesForm,
  type SiteResourcesErrors,
} from "../entities/site-resources"
import type { SaveSiteResourcesParams } from "../params/save-site-resources-params"
import type { SiteResourcesRepository } from "../repositories/site-resources-repository"

export class SaveSiteResources implements UseCase<
  SaveSiteResourcesParams,
  SaveResult<SiteResourcesErrors>
> {
  constructor(
    private readonly resources: SiteResourcesRepository,
  ) {}

  async call({
    form,
  }: SaveSiteResourcesParams): Promise<
    SaveResult<SiteResourcesErrors>
  > {
    const validation = validateSiteResourcesForm(form)
    if (!validation.valid) {
      return {
        status: "invalid",
        errors: validation.errors,
      }
    }
    const saved = await this.resources.replaceAll(
      validation.draft,
    )
    return saved.status === "failure"
      ? { status: "failed", error: saved.error }
      : { status: "saved" }
  }
}
