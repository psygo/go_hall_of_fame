import type { DataState } from "@/core/data-state"

import type { PasswordResetRecord } from "../entities/password-reset"

export type NewPasswordReset = {
  readonly adminId: number
  readonly expiresAt: Date
  /** No link is created when the admin already got one after this moment. */
  readonly sentAfter: Date
}

export type PasswordResetCompletion = {
  readonly resetId: number
  readonly adminId: number
  readonly passwordHash: string
}

export interface PasswordResetsRepository {
  /**
   * Stores a link and returns its secret token, or null (storing nothing) when the admin already
   * got a link after `sentAfter`. The check and the insert are one step, so parallel requests
   * cannot get around it. Earlier unused links stay valid.
   */
  create(
    reset: NewPasswordReset,
  ): Promise<DataState<string | null>>
  findByToken(
    token: string,
  ): Promise<DataState<PasswordResetRecord | null>>
  /**
   * In one step: marks the link used, saves the new password hash, clears the failed-attempt lock,
   * retires the admin's other links and ends the admin's sessions. Returns false when the link had already been used.
   */
  complete(
    completion: PasswordResetCompletion,
  ): Promise<DataState<boolean>>
}
