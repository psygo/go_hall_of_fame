import { asRecord, readString } from "@/core/raw-data"

export type SiteText = {
  readonly key: string
  readonly value: string
}

export class SiteTextModel implements SiteText {
  declare readonly key: string
  declare readonly value: string

  private constructor(fields: SiteText) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): SiteTextModel {
    const record = asRecord(raw, "site text")
    return new SiteTextModel({
      key: readString(record, "key"),
      value: readString(record, "value"),
    })
  }

  toEntity(): SiteText {
    return { key: this.key, value: this.value }
  }
}
