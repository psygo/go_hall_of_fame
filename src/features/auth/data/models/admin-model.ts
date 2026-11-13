import {
  asRecord,
  readInteger,
  readNullableDate,
  readString,
} from "@/core/raw-data"

import type {
  Admin,
  AdminCredentials,
} from "../../domain/entities/admin"

export class AdminModel implements Admin {
  declare readonly id: number
  declare readonly name: string
  declare readonly email: string

  protected constructor(fields: Admin) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): AdminModel {
    return new AdminModel(parseAdminFields(raw))
  }

  toEntity(): Admin {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
    }
  }
}

export class AdminCredentialsModel implements AdminCredentials {
  declare readonly admin: Admin
  declare readonly passwordHash: string
  declare readonly failedAttempts: number
  declare readonly lockedUntil: Date | null

  private constructor(fields: AdminCredentials) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): AdminCredentialsModel {
    const record = asRecord(raw, "admin")
    return new AdminCredentialsModel({
      admin: parseAdminFields(record),
      passwordHash: readString(record, "passwordHash"),
      failedAttempts: readInteger(record, "failedAttempts"),
      lockedUntil: readNullableDate(record, "lockedUntil"),
    })
  }

  toEntity(): AdminCredentials {
    return {
      admin: this.admin,
      passwordHash: this.passwordHash,
      failedAttempts: this.failedAttempts,
      lockedUntil: this.lockedUntil,
    }
  }
}

function parseAdminFields(raw: unknown): Admin {
  const record = asRecord(raw, "admin")
  return {
    id: readInteger(record, "id"),
    name: readString(record, "name"),
    email: readString(record, "email"),
  }
}
