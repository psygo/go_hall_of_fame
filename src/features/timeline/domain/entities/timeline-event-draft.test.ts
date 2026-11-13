import { describe, expect, it } from "vitest"

import {
  TIMELINE_LIMITS,
  validateTimelineEventForm,
  type TimelineEventForm,
} from "./timeline-event-draft"

function buildForm(
  overrides: Partial<TimelineEventForm> = {},
): TimelineEventForm {
  return {
    year: "1612",
    title: "Founded",
    text: "The academy opens.",
    ...overrides,
  }
}

function errorsOf(form: TimelineEventForm) {
  const result = validateTimelineEventForm(form)
  if (result.valid) throw new Error("expected invalid")
  return result.errors
}

describe("validateTimelineEventForm", () => {
  it("accepts a valid form and returns the draft", () => {
    expect(validateTimelineEventForm(buildForm())).toEqual({
      valid: true,
      draft: {
        year: 1612,
        title: "Founded",
        text: "The academy opens.",
      },
    })
  })

  it("trims every field", () => {
    expect(
      validateTimelineEventForm(
        buildForm({
          year: " 1612 ",
          title: "  Founded ",
          text: "\n Text \n",
        }),
      ),
    ).toEqual({
      valid: true,
      draft: { year: 1612, title: "Founded", text: "Text" },
    })
  })

  describe("year", () => {
    it("accepts the boundaries 1 and 2999", () => {
      expect(
        validateTimelineEventForm(buildForm({ year: "1" }))
          .valid,
      ).toBe(true)
      expect(
        validateTimelineEventForm(
          buildForm({ year: "2999" }),
        ).valid,
      ).toBe(true)
    })

    it.each(["0", "3000", "-5", "", "abc", "16.5"])(
      "rejects %j",
      (year) => {
        expect(errorsOf(buildForm({ year }))).toEqual({
          year: "Enter a year between 1 and 2999.",
        })
      },
    )
  })

  describe("title", () => {
    it.each(["", "   "])(
      "requires a title (%j)",
      (title) => {
        expect(errorsOf(buildForm({ title }))).toEqual({
          title: "Enter a title.",
        })
      },
    )

    it("accepts the limit and rejects one over", () => {
      const limit = TIMELINE_LIMITS.title
      expect(
        validateTimelineEventForm(
          buildForm({ title: "a".repeat(limit) }),
        ).valid,
      ).toBe(true)
      expect(
        errorsOf(
          buildForm({ title: "a".repeat(limit + 1) }),
        ),
      ).toEqual({
        title: `Use at most ${limit} characters.`,
      })
    })

    it("counts the limit after trimming", () => {
      const limit = TIMELINE_LIMITS.title

      expect(
        validateTimelineEventForm(
          buildForm({ title: ` ${"a".repeat(limit)} ` }),
        ).valid,
      ).toBe(true)
    })
  })

  describe("text", () => {
    it("requires a description", () => {
      expect(errorsOf(buildForm({ text: " " }))).toEqual({
        text: "Enter a description.",
      })
    })

    it("accepts the limit and rejects one over", () => {
      const limit = TIMELINE_LIMITS.text
      expect(
        validateTimelineEventForm(
          buildForm({ text: "a".repeat(limit) }),
        ).valid,
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

  it("reports every error at once", () => {
    expect(
      Object.keys(
        errorsOf({ year: "x", title: "", text: "" }),
      ),
    ).toEqual(["year", "title", "text"])
  })
})
