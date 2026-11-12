import { describe, expect, it } from "vitest"

import {
  hasNominationErrors,
  isNominationCategory,
  NOMINATION_LIMITS,
  normalizeNominationDraft,
  validateNominationDraft,
  type NominationDraft,
} from "./nomination"

function buildDraft(
  overrides: Partial<NominationDraft> = {},
): NominationDraft {
  return {
    name: "Honinbo Shusaku",
    category: "player",
    email: "fan@example.com",
    caseForInduction: "A towering figure.",
    ...overrides,
  }
}

describe("isNominationCategory", () => {
  it.each(["player", "game"])("accepts %s", (value) => {
    expect(isNominationCategory(value)).toBe(true)
  })

  it.each([
    ["an unknown category", "timeline"],
    ["a different case", "Player"],
    ["the empty string", ""],
    ["undefined", undefined],
    ["null", null],
    ["a number", 1],
  ])("rejects %s", (_name, value) => {
    expect(isNominationCategory(value)).toBe(false)
  })
})

describe("normalizeNominationDraft", () => {
  it("trims name, email and case for induction", () => {
    const normalized = normalizeNominationDraft(
      buildDraft({
        name: "  Shusaku  ",
        email: " a@b.co\n",
        caseForInduction: "\t reasons  ",
      }),
    )

    expect(normalized).toEqual({
      name: "Shusaku",
      category: "player",
      email: "a@b.co",
      caseForInduction: "reasons",
    })
  })

  it("keeps the category and does not mutate the input", () => {
    const draft = buildDraft({
      name: " x ",
      category: "game",
    })

    const normalized = normalizeNominationDraft(draft)

    expect(normalized.category).toBe("game")
    expect(draft.name).toBe(" x ")
  })
})

describe("validateNominationDraft", () => {
  it("returns no errors for a valid draft", () => {
    expect(validateNominationDraft(buildDraft())).toEqual(
      {},
    )
  })

  it("reports an empty name", () => {
    expect(
      validateNominationDraft(buildDraft({ name: "" })),
    ).toEqual({
      name: "Enter the name of the player or game.",
    })
  })

  it("reports an invalid email", () => {
    expect(
      validateNominationDraft(
        buildDraft({ email: "nope" }),
      ),
    ).toEqual({ email: "Enter a valid email address." })
  })

  it("reports both errors at once", () => {
    const errors = validateNominationDraft(
      buildDraft({ name: "", email: "" }),
    )

    expect(Object.keys(errors).sort()).toEqual([
      "email",
      "name",
    ])
  })

  it("does not require a case for induction", () => {
    expect(
      validateNominationDraft(
        buildDraft({ caseForInduction: "" }),
      ),
    ).toEqual({})
  })

  it.each([
    ["a@b.c"],
    ["first.last@sub.example.org"],
    ["a+tag@b.co"],
  ])("accepts the email %s", (email) => {
    expect(
      validateNominationDraft(buildDraft({ email })),
    ).toEqual({})
  })

  it.each([
    ["a@b", "has no dot after the at sign"],
    ["a b@c.d", "contains a space before the at sign"],
    ["a@b c.d", "contains a space after the at sign"],
    ["", "is empty"],
    ["@b.c", "has no local part"],
    ["a@.c", "has no domain part before the dot"],
    ["a@b.", "has nothing after the dot"],
    ["ab.c", "has no at sign"],
    ["a@@b.c", "has two at signs in a row"],
    ["a@.b.c", "has a domain starting with a dot"],
    ["a@b..c", "has an empty domain label"],
    ["a@b@c.d", "has two at signs"],
    ["a@b.c@", "ends with an at sign"],
  ])("rejects the email %j because it %s", (email) => {
    expect(
      validateNominationDraft(buildDraft({ email })),
    ).toHaveProperty("email")
  })
})

describe("validateNominationDraft limits", () => {
  it("rejects an email longer than the limit", () => {
    const email = `${"a".repeat(NOMINATION_LIMITS.email)}@b.co`
    expect(
      validateNominationDraft(buildDraft({ email })),
    ).toHaveProperty("email")
  })

  it("rejects a name longer than the limit", () => {
    const name = "a".repeat(NOMINATION_LIMITS.name + 1)
    expect(
      validateNominationDraft(buildDraft({ name })),
    ).toHaveProperty("name")
  })

  it("accepts a name at exactly the limit", () => {
    const name = "a".repeat(NOMINATION_LIMITS.name)
    expect(
      validateNominationDraft(buildDraft({ name })),
    ).toEqual({})
  })

  it("rejects a case for induction longer than the limit", () => {
    const caseForInduction = "a".repeat(
      NOMINATION_LIMITS.caseForInduction + 1,
    )
    expect(
      validateNominationDraft(
        buildDraft({ caseForInduction }),
      ),
    ).toHaveProperty("caseForInduction")
  })

  it("accepts an email at exactly the limit", () => {
    const local = "a".repeat(
      NOMINATION_LIMITS.email - "@b.co".length,
    )
    expect(
      validateNominationDraft(
        buildDraft({ email: `${local}@b.co` }),
      ),
    ).toEqual({})
  })

  it("accepts a case for induction at exactly the limit", () => {
    const caseForInduction = "a".repeat(
      NOMINATION_LIMITS.caseForInduction,
    )
    expect(
      validateNominationDraft(
        buildDraft({ caseForInduction }),
      ),
    ).toEqual({})
  })

  it.each([
    ["a run of dots", `a@b${".".repeat(100_000)} `],
    ["a run of at signs", "@".repeat(100_000)],
  ])(
    "rejects a hostile 100k-character email (%s) without blocking",
    (_label, email) => {
      const startedAt = performance.now()
      const errors = validateNominationDraft(
        buildDraft({ email }),
      )
      expect(errors).toHaveProperty("email")
      expect(performance.now() - startedAt).toBeLessThan(
        250,
      )
    },
  )
})

describe("hasNominationErrors", () => {
  it("is false for an empty errors object", () => {
    expect(hasNominationErrors({})).toBe(false)
  })

  it("is true when a name error is present", () => {
    expect(hasNominationErrors({ name: "x" })).toBe(true)
  })

  it("is true when an email error is present", () => {
    expect(hasNominationErrors({ email: "x" })).toBe(true)
  })
})
