import { succeed, type DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import { isResetLinkUsable } from "../entities/password-reset"
import type { TokenParams } from "../params/token-params"
import type { PasswordResetsRepository } from "../repositories/password-resets-repository"

/** Whether a reset link can still be used, so the page can say so before asking for a password. */
export class CheckResetLink implements UseCase<
  TokenParams,
  DataState<boolean>
> {
  constructor(
    private readonly resets: PasswordResetsRepository,
    private readonly clock: () => Date,
  ) {}

  async call({ token }: TokenParams) {
    const found = await this.resets.findByToken(token)
    if (found.status === "failure") return found
    return succeed(
      found.data !== null &&
        isResetLinkUsable(found.data, this.clock()),
    )
  }
}
