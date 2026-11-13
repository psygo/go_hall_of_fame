import { createHash, randomBytes } from "node:crypto"

import { and, eq, gt, lt } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import {
  adminSessionsTable,
  adminsTable,
} from "@/shared/database/data/schema"

import { AdminModel } from "../models/admin-model"

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex")

export class SessionsDataSource {
  constructor(private readonly database: Database) {}

  /** Stores a session and returns its secret token. Only the token's hash is kept. */
  async insert(session: {
    readonly adminId: number
    readonly expiresAt: Date
  }): Promise<string> {
    const token = randomBytes(32).toString("base64url")
    await this.purgeExpired()
    await this.database.insert(adminSessionsTable).values({
      adminId: session.adminId,
      tokenHash: hashToken(token),
      expiresAt: session.expiresAt,
    })
    return token
  }

  async fetchAdminByToken(lookup: {
    readonly token: string
    readonly now: Date
  }): Promise<AdminModel | null> {
    const [row] = await this.database
      .select({
        id: adminsTable.id,
        name: adminsTable.name,
        email: adminsTable.email,
      })
      .from(adminSessionsTable)
      .innerJoin(
        adminsTable,
        eq(adminSessionsTable.adminId, adminsTable.id),
      )
      .where(
        and(
          eq(
            adminSessionsTable.tokenHash,
            hashToken(lookup.token),
          ),
          gt(adminSessionsTable.expiresAt, lookup.now),
        ),
      )
    return row === undefined
      ? null
      : AdminModel.fromRawData(row)
  }

  async delete(token: string): Promise<void> {
    await this.database
      .delete(adminSessionsTable)
      .where(
        eq(adminSessionsTable.tokenHash, hashToken(token)),
      )
  }

  private async purgeExpired(): Promise<void> {
    await this.database
      .delete(adminSessionsTable)
      .where(lt(adminSessionsTable.expiresAt, new Date()))
  }
}
