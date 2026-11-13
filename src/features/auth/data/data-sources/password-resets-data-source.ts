import { createHash, randomBytes } from "node:crypto"

import { and, eq, gt, isNull, lt } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import {
  adminSessionsTable,
  adminsTable,
  passwordResetsTable,
} from "@/shared/database/data/schema"

import type {
  NewPasswordReset,
  PasswordResetCompletion,
} from "../../domain/repositories/password-resets-repository"
import { PasswordResetRecordModel } from "../models/password-reset-record-model"

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex")

export class PasswordResetsDataSource {
  constructor(private readonly database: Database) {}

  /** Stores a link and returns its secret token, or null when the admin got one after `sentAfter`. */
  async insert(
    reset: NewPasswordReset,
  ): Promise<string | null> {
    const token = randomBytes(32).toString("base64url")
    return this.database.transaction(async (tx) => {
      // Locks the admin's row, so two requests for the same admin run one after the other.
      await tx
        .select({ id: adminsTable.id })
        .from(adminsTable)
        .where(eq(adminsTable.id, reset.adminId))
        .for("update")
      const [recent] = await tx
        .select({ id: passwordResetsTable.id })
        .from(passwordResetsTable)
        .where(
          and(
            eq(passwordResetsTable.adminId, reset.adminId),
            gt(
              passwordResetsTable.createdAt,
              reset.sentAfter,
            ),
          ),
        )
        .limit(1)
      if (recent !== undefined) return null
      await tx
        .delete(passwordResetsTable)
        .where(
          lt(passwordResetsTable.expiresAt, new Date()),
        )
      await tx.insert(passwordResetsTable).values({
        adminId: reset.adminId,
        tokenHash: hashToken(token),
        expiresAt: reset.expiresAt,
      })
      return token
    })
  }

  async fetchByToken(
    token: string,
  ): Promise<PasswordResetRecordModel | null> {
    const [row] = await this.database
      .select({
        id: passwordResetsTable.id,
        adminId: passwordResetsTable.adminId,
        expiresAt: passwordResetsTable.expiresAt,
        usedAt: passwordResetsTable.usedAt,
      })
      .from(passwordResetsTable)
      .where(
        eq(passwordResetsTable.tokenHash, hashToken(token)),
      )
    return row === undefined
      ? null
      : PasswordResetRecordModel.fromRawData(row)
  }

  /** Returns false, changing nothing, when the link was already used. */
  async complete(
    completion: PasswordResetCompletion,
  ): Promise<boolean> {
    return this.database.transaction(async (tx) => {
      const used = await tx
        .update(passwordResetsTable)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(passwordResetsTable.id, completion.resetId),
            isNull(passwordResetsTable.usedAt),
          ),
        )
        .returning({ id: passwordResetsTable.id })
      if (used.length === 0) return false
      await tx
        .update(adminsTable)
        .set({
          passwordHash: completion.passwordHash,
          failedAttempts: 0,
          lockedUntil: null,
        })
        .where(eq(adminsTable.id, completion.adminId))
      await tx
        .delete(passwordResetsTable)
        .where(
          and(
            eq(
              passwordResetsTable.adminId,
              completion.adminId,
            ),
            isNull(passwordResetsTable.usedAt),
          ),
        )
      await tx
        .delete(adminSessionsTable)
        .where(
          eq(
            adminSessionsTable.adminId,
            completion.adminId,
          ),
        )
      return true
    })
  }
}
