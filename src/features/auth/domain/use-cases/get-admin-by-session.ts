import type { DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import type { Admin } from "../entities/admin"
import type { TokenParams } from "../params/token-params"
import type { SessionsRepository } from "../repositories/sessions-repository"

export class GetAdminBySession implements UseCase<
  TokenParams,
  DataState<Admin | null>
> {
  constructor(
    private readonly sessions: SessionsRepository,
    private readonly clock: () => Date,
  ) {}

  call({ token }: TokenParams) {
    return this.sessions.findAdminByToken({
      token,
      now: this.clock(),
    })
  }
}
