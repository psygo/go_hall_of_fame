import {
  asRecord,
  readBoolean,
  readInteger,
  readNullableString,
  readOneOf,
  readString,
} from "@/core/raw-data"

import {
  CONTRIBUTOR_KINDS,
  type Contributor,
} from "../../domain/entities/contributor"

export class ContributorModel implements Contributor {
  declare readonly slug: string
  declare readonly name: string
  declare readonly kind: Contributor["kind"]
  declare readonly birthYear: number
  declare readonly role: string
  declare readonly period: string
  declare readonly bio: string
  declare readonly photoUrl: string | null
  declare readonly photoPosition: string
  declare readonly isDraft: boolean

  private constructor(fields: Contributor) {
    Object.assign(this, fields)
  }

  static fromRawData(raw: unknown): ContributorModel {
    const record = asRecord(raw, "contributor")
    return new ContributorModel({
      slug: readString(record, "slug"),
      name: readString(record, "name"),
      kind: readOneOf(record, "kind", CONTRIBUTOR_KINDS),
      birthYear: readInteger(record, "birthYear"),
      role: readString(record, "role"),
      period: readString(record, "period"),
      bio: readString(record, "bio"),
      photoUrl: readNullableString(record, "photoUrl"),
      photoPosition: readString(record, "photoPosition"),
      isDraft: readBoolean(record, "isDraft"),
    })
  }

  toEntity(): Contributor {
    return { ...this }
  }
}
