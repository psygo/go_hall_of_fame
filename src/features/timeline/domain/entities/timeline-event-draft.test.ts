import { describe, expect, it } from "vitest"

import {
  TIMELINE_LIMITS,
  validateTimelineEventForm,
  type TimelineEventForm,
} from "./timeline-event-draft"

const gameOptions = [
  { slug: "alphago-game-4", name: "AlphaGo Game 4" },
]

function buildForm(
  overrides: Partial<TimelineEventForm> = {},
): TimelineEventForm {
  return {
    year: "1612",
    title: "Founded",
    text: "The academy opens.",
    gameSlug: "",
    ...overrides,
  }
}

function validate(form: TimelineEventForm) {
  return validateTimelineEventForm(form, gameOptions)
}

function errorsOf(form: TimelineEventForm) {
  const result = validate(form)
  if (result.valid) throw new Error("expected invalid")
  return result.errors
}

describe("validateTimelineEventForm", () => {
  it("accepts a valid form and returns the draft", () => {
    expect(validate(buildForm())).toEqual({
      valid: true,
      draft: {
        year: 1612,
        title: "Founded",
        text: "The academy opens.",
        gameSlug: null,
      },
    })
  })

  it("trims every field", () => {
    expect(
      validate(
        buildForm({
          year: " 1612 ",
          title: "  Founded ",
          text: "\n Text \n",
        }),
      ),
    ).toEqual({
      valid: true,
      draft: {
        year: 1612,
        title: "Founded",
        text: "Text",
        gameSlug: null,
      },
    })
  })

  describe("year", () => {
    it("accepts the boundaries 1 and 2999", () => {
      expect(validate(buildForm({ year: "1" })).valid).toBe(
        true,
      )
      expect(
        validate(buildForm({ year: "2999" })).valid,
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

    it("counts the limit after trimming", () => {
      const limit = TIMELINE_LIMITS.title

      expect(
        validate(
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

  it("reports every error at once", () => {
    expect(
      Object.keys(
        errorsOf({
          year: "x",
          title: "",
          text: "",
          gameSlug: "ghost",
        }),
      ),
    ).toEqual(["year", "title", "text", "gameSlug"])
  })
  describe("gameSlug", () => {
    it("links a known game, trimmed", () => {
      expect(
        validate(
          buildForm({ gameSlug: " alphago-game-4 " }),
        ),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          gameSlug: "alphago-game-4",
        }),
      })
    })

    it("rejects a game that is not in the Hall", () => {
      expect(
        errorsOf(buildForm({ gameSlug: "ghost" })),
      ).toEqual({
        gameSlug: "Choose a game that is in the Hall.",
      })
    })
  })
})
