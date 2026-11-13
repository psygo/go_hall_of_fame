import { describe, expect, it } from "vitest"

import {
  TIMELINE_LIMITS,
  validateTimelineEventForm,
  type TimelineEventForm,
} from "./timeline-event-draft"

const options = {
  games: [
    { slug: "alphago-game-4", name: "AlphaGo Game 4" },
    { slug: "ear-reddening", name: "Ear-reddening" },
  ],
  players: [
    { slug: "shusaku", name: "Shusaku" },
    { slug: "lee-sedol", name: "Lee Sedol" },
  ],
}

function buildForm(
  overrides: Partial<TimelineEventForm> = {},
): TimelineEventForm {
  return {
    year: "1612",
    title: "Founded",
    text: "The academy opens.",
    gameSlugs: [],
    playerSlugs: [],
    isDraft: false,
    ...overrides,
  }
}

function validate(form: TimelineEventForm) {
  return validateTimelineEventForm(form, options)
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
        year: "1612",
        title: "Founded",
        text: "The academy opens.",
        gameSlugs: [],
        playerSlugs: [],
        isDraft: false,
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
        year: "1612",
        title: "Founded",
        text: "Text",
        gameSlugs: [],
        playerSlugs: [],
        isDraft: false,
      },
    })
  })

  describe("year", () => {
    it("accepts any label, trimmed", () => {
      expect(
        validate(buildForm({ year: " Late 1800s " })),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          year: "Late 1800s",
        }),
      })
    })

    it.each(["", "   "])("requires a year (%j)", (year) => {
      expect(errorsOf(buildForm({ year }))).toEqual({
        year: "Enter a year or period.",
      })
    })

    it("accepts the limit and rejects one over", () => {
      const limit = TIMELINE_LIMITS.year
      expect(
        validate(buildForm({ year: "a".repeat(limit) }))
          .valid,
      ).toBe(true)
      expect(
        errorsOf(
          buildForm({ year: "a".repeat(limit + 1) }),
        ),
      ).toEqual({
        year: `Use at most ${limit} characters.`,
      })
    })
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

  it("carries the draft flag through, false by default", () => {
    expect(validate(buildForm())).toEqual({
      valid: true,
      draft: expect.objectContaining({ isDraft: false }),
    })
    expect(validate(buildForm({ isDraft: true }))).toEqual({
      valid: true,
      draft: expect.objectContaining({ isDraft: true }),
    })
  })

  it("reports every error at once", () => {
    expect(
      Object.keys(
        errorsOf({
          year: "",
          title: "",
          text: "",
          gameSlugs: ["ghost"],
          playerSlugs: ["ghost"],
          isDraft: false,
        }),
      ),
    ).toEqual([
      "year",
      "title",
      "text",
      "gameSlugs",
      "playerSlugs",
    ])
  })

  describe("links", () => {
    function draftOf(
      overrides: Partial<TimelineEventForm>,
    ) {
      const result = validate(buildForm(overrides))
      if (!result.valid) throw new Error("expected valid")
      return result.draft
    }

    it("keeps known games and players, trimmed, in order", () => {
      const draft = draftOf({
        gameSlugs: [" ear-reddening ", "alphago-game-4"],
        playerSlugs: [" lee-sedol", "shusaku "],
      })

      expect(draft.gameSlugs).toEqual([
        "ear-reddening",
        "alphago-game-4",
      ])
      expect(draft.playerSlugs).toEqual([
        "lee-sedol",
        "shusaku",
      ])
    })

    it("drops blank rows and repeats, keeping the first", () => {
      const draft = draftOf({
        gameSlugs: [
          "",
          "ear-reddening",
          "  ",
          "ear-reddening",
        ],
        playerSlugs: ["shusaku", "lee-sedol", " shusaku"],
      })

      expect(draft.gameSlugs).toEqual(["ear-reddening"])
      expect(draft.playerSlugs).toEqual([
        "shusaku",
        "lee-sedol",
      ])
    })

    it("rejects an unknown game or player", () => {
      expect(
        errorsOf(buildForm({ gameSlugs: ["ghost"] })),
      ).toEqual({
        gameSlugs: "Choose a game that is in the Hall.",
      })
      expect(
        errorsOf(buildForm({ playerSlugs: ["ghost"] })),
      ).toEqual({
        playerSlugs: "Choose a player who is in the Hall.",
      })
    })

    it("does not accept a player slug as a game", () => {
      expect(
        errorsOf(buildForm({ gameSlugs: ["shusaku"] })),
      ).toHaveProperty("gameSlugs")
    })

    it("accepts the maximum links and rejects one more", () => {
      const many = (count: number) =>
        Array.from({ length: count }, (_, i) => `g${i}`)
      const big = {
        games: many(TIMELINE_LIMITS.maxLinks + 1).map(
          (slug) => ({ slug, name: slug }),
        ),
        players: many(TIMELINE_LIMITS.maxLinks + 1).map(
          (slug) => ({ slug, name: slug }),
        ),
      }
      const check = (count: number) =>
        validateTimelineEventForm(
          buildForm({
            gameSlugs: many(count),
            playerSlugs: many(count),
          }),
          big,
        )

      expect(check(TIMELINE_LIMITS.maxLinks).valid).toBe(
        true,
      )
      expect(check(TIMELINE_LIMITS.maxLinks + 1)).toEqual({
        valid: false,
        errors: {
          gameSlugs: `Link at most ${TIMELINE_LIMITS.maxLinks}.`,
          playerSlugs: `Link at most ${TIMELINE_LIMITS.maxLinks}.`,
        },
      })
    })

    it("counts the maximum after removing repeats and blanks", () => {
      const slugs = [
        ...Array.from(
          { length: TIMELINE_LIMITS.maxLinks },
          () => "ear-reddening",
        ),
        "",
        "alphago-game-4",
      ]

      expect(
        validate(buildForm({ gameSlugs: slugs })).valid,
      ).toBe(true)
    })
  })
})
