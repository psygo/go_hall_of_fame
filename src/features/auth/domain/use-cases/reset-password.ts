import type { UseCase } from "@/core/use-case"

import { isPasswordLongEnough } from "../entities/admin"
import {
  isResetLinkUsable,
  type ResetPasswordResult,
} from "../entities/password-reset"
import type { ResetPasswordParams } from "../params/reset-password-params"
import type { PasswordEncoder } from "../repositories/password-encoder"
import type { PasswordResetsRepository } from "../repositories/password-resets-repository"

export class ResetPassword implements UseCase<
  ResetPasswordParams,
  ResetPasswordResult
> {
  constructor(
    private readonly resets: PasswordResetsRepository,
    private readonly encoder: PasswordEncoder,
    private readonly clock: () => Date,
  ) {}

  async call({
    token,
    password,
    confirmation,
  }: ResetPasswordParams): Promise<ResetPasswordResult> {
    if (!isPasswordLongEnough(password)) {
      return { status: "weak" }
    }
    if (password !== confirmation) {
      return { status: "mismatch" }
    }
    const found = await this.resets.findByToken(token)
    if (found.status === "failure") {
      return { status: "failed", error: found.error }
    }
    if (
      found.data === null ||
      !isResetLinkUsable(found.data, this.clock())
    ) {
      return { status: "invalid-link" }
    }
    const completed = await this.resets.complete({
      resetId: found.data.id,
      adminId: found.data.adminId,
      passwordHash: await this.encoder.hash(password),
    })
    if (completed.status === "failure") {
      return { status: "failed", error: completed.error }
    }
    return completed.data
      ? { status: "reset" }
      : { status: "invalid-link" }
  }
}
