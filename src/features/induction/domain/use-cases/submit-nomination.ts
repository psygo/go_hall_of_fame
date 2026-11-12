import type { UseCase } from "@/core/use-case"

import {
  hasNominationErrors,
  normalizeNominationDraft,
  validateNominationDraft,
  type NominationSubmission,
} from "../entities/nomination"
import type { SubmitNominationParams } from "../params/submit-nomination-params"
import type { NominationsRepository } from "../repositories/nominations-repository"

export class SubmitNomination implements UseCase<
  SubmitNominationParams,
  NominationSubmission
> {
  constructor(
    private readonly nominations: NominationsRepository,
  ) {}

  async call(
    params: SubmitNominationParams,
  ): Promise<NominationSubmission> {
    const draft = normalizeNominationDraft(params.draft)
    const errors = validateNominationDraft(draft)
    if (hasNominationErrors(errors)) {
      return { status: "invalid", errors }
    }
    const saved = await this.nominations.submit(draft)
    if (saved.status === "failure")
      return { status: "failed", error: saved.error }
    return { status: "accepted", draft }
  }
}
