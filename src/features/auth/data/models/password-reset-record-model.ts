import {
  asRecord,
  readDate,
  readInteger,
  readNullableDate,
} from "@/core/raw-data"

import type { PasswordResetRecord } from "../../domain/entities/password-reset"

export class PasswordResetRecordModel implements PasswordResetRecord {
  declare readonly id: number
  declare readonly adminId: number
  declare readonly expiresAt: Date
  declare readonly usedAt: Date | null

  private constructor(fields: PasswordResetRecord) {
    Object.assign(this, fields)
  }

  static fromRawData(
    raw: unknown,
  ): PasswordResetRecordModel {
    const record = asRecord(raw, "password reset")
    return new PasswordResetRecordModel({
      id: readInteger(record, "id"),
      adminId: readInteger(record, "adminId"),
      expiresAt: readDate(record, "expiresAt"),
      usedAt: readNullableDate(record, "usedAt"),
    })
  }

  toEntity(): PasswordResetRecord {
    return { ...this }
  }
}
