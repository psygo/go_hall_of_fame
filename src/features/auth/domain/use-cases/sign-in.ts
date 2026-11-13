import type { UseCase } from "@/core/use-case"

import {
  isLocked,
  lockoutAfterFailure,
  normalizeEmail,
  sessionExpiry,
  type AdminCredentials,
} from "../entities/admin"
import type { SignInResult } from "../entities/sign-in-result"
import type { SignInParams } from "../params/sign-in-params"
import type { AdminsRepository } from "../repositories/admins-repository"
import type { PasswordVerifier } from "../repositories/password-verifier"
import type { SessionsRepository } from "../repositories/sessions-repository"

export class SignIn implements UseCase<
  SignInParams,
  SignInResult
> {
  constructor(
    private readonly admins: AdminsRepository,
    private readonly sessions: SessionsRepository,
    private readonly passwords: PasswordVerifier,
    private readonly clock: () => Date,
  ) {}

  async call(params: SignInParams): Promise<SignInResult> {
    const found = await this.admins.findCredentialsByEmail(
      normalizeEmail(params.email),
    )
    if (found.status === "failure") {
      return { status: "failed", error: found.error }
    }
    return this.checkCredentials(
      found.data,
      params.password,
    )
  }

  private async checkCredentials(
    credentials: AdminCredentials | null,
    password: string,
  ): Promise<SignInResult> {
    const now = this.clock()
    if (
      credentials !== null &&
      isLocked(credentials, now)
    ) {
      return {
        status: "locked",
        until: credentials.lockedUntil ?? now,
      }
    }
    const isCorrect = await this.passwords.verify(
      password,
      credentials?.passwordHash ?? null,
    )
    if (credentials === null || !isCorrect) {
      return this.rejectAttempt(credentials, now)
    }
    return this.startSession(credentials, now)
  }

  private hasLapsedLock(
    credentials: AdminCredentials,
    now: Date,
  ): boolean {
    const { lockedUntil } = credentials
    return (
      lockedUntil !== null &&
      lockedUntil.getTime() <= now.getTime()
    )
  }

  private async rejectAttempt(
    credentials: AdminCredentials | null,
    now: Date,
  ): Promise<SignInResult> {
    if (credentials === null) return { status: "invalid" }
    const previous = this.hasLapsedLock(credentials, now)
      ? 0
      : credentials.failedAttempts
    const failedAttempts = previous + 1
    const lockedUntil = lockoutAfterFailure(
      failedAttempts,
      now,
    )
    const recorded = await this.admins.recordFailedAttempt({
      adminId: credentials.admin.id,
      failedAttempts,
      lockedUntil,
    })
    if (recorded.status === "failure") {
      return { status: "failed", error: recorded.error }
    }
    return lockedUntil === null
      ? { status: "invalid" }
      : { status: "locked", until: lockedUntil }
  }

  private async startSession(
    credentials: AdminCredentials,
    now: Date,
  ): Promise<SignInResult> {
    const { admin } = credentials
    const cleared = await this.admins.clearFailedAttempts(
      admin.id,
    )
    if (cleared.status === "failure") {
      return { status: "failed", error: cleared.error }
    }
    const expiresAt = sessionExpiry(now)
    const created = await this.sessions.create({
      adminId: admin.id,
      expiresAt,
    })
    if (created.status === "failure") {
      return { status: "failed", error: created.error }
    }
    return {
      status: "signed-in",
      admin,
      token: created.data,
      expiresAt,
    }
  }
}
