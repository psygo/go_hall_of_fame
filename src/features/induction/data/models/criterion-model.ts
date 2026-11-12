import {
  asRecord,
  readInteger,
  readString,
} from "@/core/raw-data"

import type { Criterion } from "../../domain/entities/criterion"

export class CriterionModel implements Criterion {
  declare readonly position: number
  declare readonly title: string
  declare readonly text: string

  private constructor(fields: Criterion) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): CriterionModel {
    const record = asRecord(raw, "criterion")
    return new CriterionModel({
      position: readInteger(record, "position"),
      title: readString(record, "title"),
      text: readString(record, "text"),
    })
  }

  toEntity(): Criterion {
    return { ...this }
  }
}
