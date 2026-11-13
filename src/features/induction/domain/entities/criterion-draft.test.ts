import { describe, expect, it } from "vitest"

import type { Criterion } from "./criterion"
import {
  CRITERION_LIMITS,
  nextPosition,
  validateCriterionForm,
  type CriterionForm,
} from "./criterion-draft"

const existing: readonly Criterion[] = [
  { id: 1, position: 1, title: "A", text: "a" },
  { id: 2, position: 2, title: "B", text: "b" },
]

function buildForm(
  overrides: Partial<CriterionForm> = {},
): CriterionForm {
  return {
    position: "3",
    title: "Mastery",
    text: "Sustained excellence.",
    ...overrides,
  }
}

function validate(
  form: CriterionForm,
  editingId: number | null = null,
  criteria: readonly Criterion[] = existing,
) {
  return validateCriterionForm(form, {
    existing: criteria,
    editingId,
  })
}

function errorsOf(
  form: CriterionForm,
  editingId: number | null = null,
) {
  const result = validate(form, editingId)
  if (result.valid) throw new Error("expected invalid")
  return result.errors
}

describe("nextPosition", () => {
  it("is one for no criteria", () => {
    expect(nextPosition([])).toBe(1)
  })

  it("is one past the highest position, even with gaps", () => {
    expect(
      nextPosition([
        { id: 1, position: 2, title: "t", text: "x" },
        { id: 2, position: 7, title: "t", text: "x" },
      ]),
    ).toBe(8)
  })
})

describe("validateCriterionForm", () => {
  it("accepts a valid form", () => {
    expect(validate(buildForm())).toEqual({
      valid: true,
      draft: {
        position: 3,
        title: "Mastery",
        text: "Sustained excellence.",
      },
    })
  })

  it("trims the title and the text", () => {
    expect(
      validate(buildForm({ title: " T ", text: " X " })),
    ).toEqual({
      valid: true,
      draft: { position: 3, title: "T", text: "X" },
    })
  })

  describe("position", () => {
    it("defaults to the next position when blank", () => {
      expect(
        validate(buildForm({ position: "  " })),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({ position: 3 }),
      })
    })

    it("defaults to one when blank and nothing exists", () => {
      expect(
        validate(buildForm({ position: "" }), null, []),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({ position: 1 }),
      })
    })

    it("accepts 1 and the maximum", () => {
      expect(
        validate(buildForm({ position: "99" })).valid,
      ).toBe(true)
      expect(
        validate(buildForm({ position: "1" }), 1).valid,
      ).toBe(true)
    })

    it.each(["0", "100", "-1", "x", "1.5"])(
      "rejects %j",
      (position) => {
        expect(errorsOf(buildForm({ position }))).toEqual({
          position: `Enter a whole number from 1 to ${CRITERION_LIMITS.maxPosition}.`,
        })
      },
    )

    it("rejects a position another criterion has", () => {
      expect(
        errorsOf(buildForm({ position: "2" })),
      ).toEqual({
        position:
          "Another criterion already has this number.",
      })
    })

    it("allows the criterion being edited to keep its own position", () => {
      expect(
        validate(buildForm({ position: "2" }), 2).valid,
      ).toBe(true)
    })

    it("still rejects taking another's position while editing", () => {
      expect(
        errorsOf(buildForm({ position: "1" }), 2),
      ).toEqual({
        position:
          "Another criterion already has this number.",
      })
    })
  })

  describe("title", () => {
    it("is required", () => {
      expect(errorsOf(buildForm({ title: "  " }))).toEqual({
        title: "Enter a title.",
      })
    })

    it("accepts the limit and rejects one over", () => {
      const limit = CRITERION_LIMITS.title
      expect(
        validate(buildForm({ title: "a".repeat(limit) }))
          .valid,
      ).toBe(true)
      expect(
        errorsOf(
          buildForm({ title: "a".repeat(limit + 1) }),
        ),
      ).toEqual({
        title: `Use at most ${limit} characters.`,
      })
    })
  })

  describe("text", () => {
    it("is required", () => {
      expect(errorsOf(buildForm({ text: "" }))).toEqual({
        text: "Enter a description.",
      })
    })

    it("accepts the limit and rejects one over", () => {
      const limit = CRITERION_LIMITS.text
      expect(
        validate(buildForm({ text: "a".repeat(limit) }))
          .valid,
      ).toBe(true)
      expect(
        errorsOf(
          buildForm({ text: "a".repeat(limit + 1) }),
        ),
      ).toEqual({
        text: `Use at most ${limit} characters.`,
      })
    })
  })
})
