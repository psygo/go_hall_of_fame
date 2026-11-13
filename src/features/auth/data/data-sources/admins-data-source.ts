import { eq } from "drizzle-orm"

import type { Database } from "@/shared/database/data/database"
import { adminsTable } from "@/shared/database/data/schema"

import { AdminCredentialsModel } from "../models/admin-model"

export class AdminsDataSource {
  constructor(private readonly database: Database) {}

  async fetchCredentialsByEmail(
    email: string,
  ): Promise<AdminCredentialsModel | null> {
    const [row] = await this.database
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, email))
    return row === undefined
      ? null
      : AdminCredentialsModel.fromRawData(row)
  }

  async updateFailedAttempts(update: {
    readonly adminId: number
    readonly failedAttempts: number
    readonly lockedUntil: Date | null
  }): Promise<void> {
    await this.database
      .update(adminsTable)
      .set({
        failedAttempts: update.failedAttempts,
        lockedUntil: update.lockedUntil,
      })
      .where(eq(adminsTable.id, update.adminId))
  }
}
