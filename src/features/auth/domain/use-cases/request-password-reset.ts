import type { UseCase } from "@/core/use-case"

import {
  normalizeEmail,
  type Admin,
} from "../entities/admin"
import {
  cooldownStart,
  RESET_LINK_MINUTES,
  resetLinkExpiry,
  type RequestResetResult,
} from "../entities/password-reset"
import type { RequestPasswordResetParams } from "../params/request-password-reset-params"
import type { AdminsRepository } from "../repositories/admins-repository"
import type { PasswordResetsRepository } from "../repositories/password-resets-repository"
import type { ResetMailer } from "../repositories/reset-mailer"

/**
 * Sends a reset link to an admin's email. Whether or not the email belongs to an admin, the answer
 * is the same, so the form cannot be used to find out who the admins are.
 */
export class RequestPasswordReset implements UseCase<
  RequestPasswordResetParams,
  RequestResetResult
> {
  constructor(
    private readonly admins: AdminsRepository,
    private readonly resets: PasswordResetsRepository,
    private readonly mailer: ResetMailer,
    /** The site's address, without a trailing slash; null when it is not configured. */
    private readonly siteUrl: string | null,
    private readonly clock: () => Date,
  ) {}

  async call({ email }: RequestPasswordResetParams) {
    const found = await this.admins.findCredentialsByEmail(
      normalizeEmail(email),
    )
    if (found.status === "failure") {
      return {
        status: "failed",
        error: found.error,
      } as const
    }
    if (found.data === null) {
      return {
        status: "requested",
        error: null,
        deliver: null,
      } as const
    }
    return this.prepareLink(found.data.admin)
  }

  /** Stores the link now; the email itself is sent later, by `deliver`. */
  private async prepareLink(admin: Admin) {
    if (this.siteUrl === null) {
      return this.notSent(
        new Error("SITE_URL is not configured"),
      )
    }
    const now = this.clock()
    const token = await this.resets.create({
      adminId: admin.id,
      expiresAt: resetLinkExpiry(now),
      sentAfter: cooldownStart(now),
    })
    if (token.status === "failure")
      return this.notSent(token.error)
    // Null: a link went out a moment ago, so nothing more is sent.
    const secret = token.data
    if (secret === null) return this.notSent(null)
    return {
      status: "requested",
      error: null,
      deliver: () => this.sendEmail(admin, secret),
    } as const
  }

  private notSent(error: Error | null) {
    return {
      status: "requested",
      error,
      deliver: null,
    } as const
  }

  private async sendEmail(
    admin: Admin,
    token: string,
  ): Promise<Error | null> {
    const sent = await this.mailer.send({
      to: admin.email,
      name: admin.name,
      link: `${this.siteUrl}/admin/reset-password?token=${encodeURIComponent(token)}`,
      validForMinutes: RESET_LINK_MINUTES,
    })
    return sent.status === "failure" ? sent.error : null
  }
}
