import {
  asRecord,
  readDate,
  readInteger,
  readOneOf,
  readString,
} from "@/core/raw-data"

import { NOMINATION_CATEGORIES } from "../../domain/entities/nomination"
import {
  NOMINATION_STATUSES,
  type NominationRecord,
} from "../../domain/entities/nomination-record"

export class NominationRecordModel implements NominationRecord {
  declare readonly id: number
  declare readonly name: string
  declare readonly category: NominationRecord["category"]
  declare readonly email: string
  declare readonly caseForInduction: string
  declare readonly status: NominationRecord["status"]
  declare readonly createdAt: Date

  private constructor(fields: NominationRecord) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): NominationRecordModel {
    const record = asRecord(raw, "nomination")
    return new NominationRecordModel({
      id: readInteger(record, "id"),
      name: readString(record, "name"),
      category: readOneOf(
        record,
        "category",
        NOMINATION_CATEGORIES,
      ),
      email: readString(record, "email"),
      caseForInduction: readString(
        record,
        "caseForInduction",
      ),
      status: readOneOf(
        record,
        "status",
        NOMINATION_STATUSES,
      ),
      createdAt: readDate(record, "createdAt"),
    })
  }

  toEntity(): NominationRecord {
    return { ...this }
  }
}
