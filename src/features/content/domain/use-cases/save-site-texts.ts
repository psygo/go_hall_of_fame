import type { UseCase } from "@/core/use-case"
import type {
  FieldErrors,
  SaveResult,
} from "@/core/validation"

import { validateSiteTextsForm } from "../entities/page-text"
import type { SaveSiteTextsParams } from "../params/save-site-texts-params"
import type { SiteTextsRepository } from "../repositories/site-texts-repository"

export class SaveSiteTexts implements UseCase<
  SaveSiteTextsParams,
  SaveResult<FieldErrors>
> {
  constructor(
    private readonly siteTexts: SiteTextsRepository,
  ) {}

  async call({
    form,
  }: SaveSiteTextsParams): Promise<
    SaveResult<FieldErrors>
  > {
    const validation = validateSiteTextsForm(form)
    if (!validation.valid) {
      return {
        status: "invalid",
        errors: validation.errors,
      }
    }
    const applied = await this.siteTexts.apply(
      validation.draft,
    )
    return applied.status === "failure"
      ? { status: "failed", error: applied.error }
      : { status: "saved" }
  }
}
