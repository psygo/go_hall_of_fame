import {
  asRecord,
  readBoolean,
  readDate,
  readInteger,
  readString,
} from "@/core/raw-data"

import type { FeedbackRecord } from "../../domain/entities/feedback-record"

export class FeedbackRecordModel implements FeedbackRecord {
  declare readonly id: number
  declare readonly email: string
  declare readonly description: string
  declare readonly isRead: boolean
  declare readonly createdAt: Date

  private constructor(fields: FeedbackRecord) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): FeedbackRecordModel {
    const record = asRecord(raw, "feedback")
    return new FeedbackRecordModel({
      id: readInteger(record, "id"),
      email: readString(record, "email"),
      description: readString(record, "description"),
      isRead: readBoolean(record, "isRead"),
      createdAt: readDate(record, "createdAt"),
    })
  }

  toEntity(): FeedbackRecord {
    return { ...this }
  }
}
