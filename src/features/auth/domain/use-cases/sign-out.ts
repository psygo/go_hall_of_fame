import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { TokenParams } from "../params/token-params"
import type { SessionsRepository } from "../repositories/sessions-repository"

export class SignOut implements UseCase<
  TokenParams,
  DataState<void>
> {
  constructor(
    private readonly sessions: SessionsRepository,
  ) {}

  call({ token }: TokenParams) {
    return this.sessions.delete(token)
  }
}
