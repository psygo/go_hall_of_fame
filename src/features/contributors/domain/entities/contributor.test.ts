import { describe, expect, it } from "vitest"

import {
  CONTRIBUTOR_KIND_LABELS,
  CONTRIBUTOR_KINDS,
  isContributorKind,
} from "./contributor"

describe("isContributorKind", () => {
  it("accepts the known kinds only", () => {
    expect(isContributorKind("person")).toBe(true)
    expect(isContributorKind("organization")).toBe(true)
    expect(isContributorKind("entity")).toBe(true)
    expect(isContributorKind("Person")).toBe(false)
    expect(isContributorKind("")).toBe(false)
  })

  it("lists the three kinds", () => {
    expect(CONTRIBUTOR_KINDS).toEqual([
      "person",
      "organization",
      "entity",
    ])
    expect(CONTRIBUTOR_KIND_LABELS.entity).toBe("Entity")
  })

  it("has a label for every kind", () => {
    for (const kind of CONTRIBUTOR_KINDS) {
      expect(CONTRIBUTOR_KIND_LABELS[kind]).toBeTruthy()
    }
  })
})
