import {
  asRecord,
  readNullableString,
  readString,
} from "@/core/raw-data"
import type { ResourceLink } from "@/core/resources"

export class ResourceLinkModel implements ResourceLink {
  declare readonly url: string
  declare readonly description: string | null

  private constructor(fields: ResourceLink) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): ResourceLinkModel {
    const record = asRecord(raw, "resource")
    return new ResourceLinkModel({
      url: readString(record, "url"),
      description: readNullableString(
        record,
        "description",
      ),
    })
  }

  toEntity(): ResourceLink {
    return { ...this }
  }
}
