import { describe, expect, it } from "vitest"

import type { Game, GamePlayerReference } from "./game"
import {
  GAME_LIMITS,
  validateGameForm,
  type GameForm,
} from "./game-draft"

function buildGame(slug: string): Game {
  return {
    slug,
    year: 1900,
    name: slug,
    black: "B",
    white: "W",
    result: "B+R",
    setting: "S",
    hook: "H",
    moment: "M",
    legacy: "L",
    sgfUrl: null,
    featured: false,
    sequence: 0,
  }
}

const existing = [
  buildGame("ear-reddening"),
  buildGame("move-78"),
]
const playerOptions: readonly GamePlayerReference[] = [
  { slug: "shusaku", name: "Shusaku" },
  { slug: "lee-sedol", name: "Lee Sedol" },
]

function buildForm(
  overrides: Partial<GameForm> = {},
): GameForm {
  return {
    slug: "alphago-game-4",
    year: "2016",
    name: "AlphaGo Game 4",
    black: "Lee Sedol",
    white: "AlphaGo",
    result: "W+R",
    setting: "Seoul",
    hook: "The wedge.",
    moment: "Move 78.",
    legacy: "It endures.",
    sgfUrl: "/sgf/game-4.sgf",
    sequence: "1",
    featured: false,
    playerSlugs: ["lee-sedol"],
    ...overrides,
  }
}

function validate(
  form: GameForm,
  originalSlug: string | null = null,
) {
  return validateGameForm(form, {
    existing,
    originalSlug,
    playerOptions,
  })
}

function errorsOf(
  form: GameForm,
  originalSlug: string | null = null,
) {
  const result = validate(form, originalSlug)
  if (result.valid) throw new Error("expected invalid")
  return result.errors
}

describe("validateGameForm", () => {
  it("accepts a valid form and returns the draft", () => {
    expect(validate(buildForm())).toEqual({
      valid: true,
      draft: {
        slug: "alphago-game-4",
        year: 2016,
        name: "AlphaGo Game 4",
        black: "Lee Sedol",
        white: "AlphaGo",
        result: "W+R",
        setting: "Seoul",
        hook: "The wedge.",
        moment: "Move 78.",
        legacy: "It endures.",
        sgfUrl: "/sgf/game-4.sgf",
        sequence: 1,
        featured: false,
        playerSlugs: ["lee-sedol"],
      },
    })
  })

  it("trims every text field", () => {
    const result = validate(
      buildForm({
        slug: " alphago-game-4 ",
        year: " 2016 ",
        name: " AlphaGo Game 4 ",
        black: " Lee Sedol ",
        white: " AlphaGo ",
        result: " W+R ",
        setting: " Seoul ",
        hook: " Hook ",
        moment: " Moment ",
        legacy: " Legacy ",
        sgfUrl: " /sgf/a.sgf ",
        sequence: " 2 ",
      }),
    )

    expect(result).toEqual({
      valid: true,
      draft: expect.objectContaining({
        slug: "alphago-game-4",
        year: 2016,
        name: "AlphaGo Game 4",
        black: "Lee Sedol",
        white: "AlphaGo",
        result: "W+R",
        setting: "Seoul",
        hook: "Hook",
        moment: "Moment",
        legacy: "Legacy",
        sgfUrl: "/sgf/a.sgf",
        sequence: 2,
      }),
    })
  })

  describe("slug", () => {
    it("checks the defaulted slug for duplicates", () => {
      expect(
        errorsOf(buildForm({ slug: "", name: "Move 78" })),
      ).toEqual({
        slug: "Another game already uses this slug.",
      })
    })

    it("defaults to the slugified name when blank", () => {
      expect(
        validate(
          buildForm({ slug: " ", name: "Wedge Game" }),
        ),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          slug: "wedge-game",
        }),
      })
    })

    it("errors when blank and the name has no Latin letters", () => {
      expect(
        errorsOf(
          buildForm({ slug: "", name: "耳赤の一局" }),
        ).slug,
      ).toMatch(/lowercase letters/)
    })

    it("rejects a malformed slug", () => {
      expect(
        errorsOf(buildForm({ slug: "Bad Slug" })).slug,
      ).toMatch(/lowercase letters/)
    })

    it("rejects the reserved slug new", () => {
      expect(errorsOf(buildForm({ slug: "new" }))).toEqual({
        slug: "“new” is reserved.",
      })
    })

    it("rejects a slug another game has", () => {
      expect(
        errorsOf(buildForm({ slug: "ear-reddening" })),
      ).toEqual({
        slug: "Another game already uses this slug.",
      })
    })

    it("allows the game being edited to keep its slug", () => {
      expect(
        validate(
          buildForm({ slug: "ear-reddening" }),
          "ear-reddening",
        ).valid,
      ).toBe(true)
    })

    it("rejects taking another game's slug while editing", () => {
      expect(
        errorsOf(
          buildForm({ slug: "move-78" }),
          "ear-reddening",
        ).slug,
      ).toBe("Another game already uses this slug.")
    })
  })

  describe("year", () => {
    it("accepts 1 and 2999", () => {
      expect(validate(buildForm({ year: "1" })).valid).toBe(
        true,
      )
      expect(
        validate(buildForm({ year: "2999" })).valid,
      ).toBe(true)
    })

    it.each(["0", "3000", "-1", "", "abc"])(
      "rejects %j",
      (year) => {
        expect(errorsOf(buildForm({ year }))).toEqual({
          year: "Enter a year between 1 and 2999.",
        })
      },
    )
  })

  describe.each([
    ["name", "a name", GAME_LIMITS.name],
    ["black", "the Black player", GAME_LIMITS.side],
    ["white", "the White player", GAME_LIMITS.side],
    ["result", "the result", GAME_LIMITS.result],
    ["setting", "the setting", GAME_LIMITS.setting],
    ["hook", "the hook", GAME_LIMITS.hook],
    ["moment", "the moment", GAME_LIMITS.moment],
    ["legacy", "why it endures", GAME_LIMITS.legacy],
  ] as const)("%s", (field, what, limit) => {
    it("is required", () => {
      expect(
        errorsOf(buildForm({ [field]: "  " }))[field],
      ).toBe(`Enter ${what}.`)
    })

    it("accepts the limit and rejects one over", () => {
      expect(
        validate(buildForm({ [field]: "a".repeat(limit) }))
          .valid,
      ).toBe(true)
      expect(
        errorsOf(
          buildForm({ [field]: "a".repeat(limit + 1) }),
        )[field],
      ).toBe(`Use at most ${limit} characters.`)
    })
  })

  describe("sgfUrl", () => {
    it("turns a blank URL into null", () => {
      expect(validate(buildForm({ sgfUrl: "  " }))).toEqual(
        {
          valid: true,
          draft: expect.objectContaining({ sgfUrl: null }),
        },
      )
    })

    it.each(["/sgf/a.sgf", "https://example.com/a.sgf"])(
      "accepts %s",
      (sgfUrl) => {
        expect(validate(buildForm({ sgfUrl })).valid).toBe(
          true,
        )
      },
    )

    it.each([
      "javascript:alert(1)",
      "//evil.example/a.sgf",
      "http://example.com/a.sgf",
      "/sgf/a b.sgf",
    ])("rejects %s", (sgfUrl) => {
      expect(errorsOf(buildForm({ sgfUrl }))).toEqual({
        sgfUrl:
          "Use a path such as /sgf/name.sgf, or an https URL.",
      })
    })
  })

  describe("sequence", () => {
    it("defaults to 0 when blank", () => {
      expect(validate(buildForm({ sequence: "" }))).toEqual(
        {
          valid: true,
          draft: expect.objectContaining({ sequence: 0 }),
        },
      )
    })

    it("accepts 0 and 99", () => {
      expect(
        validate(buildForm({ sequence: "0" })).valid,
      ).toBe(true)
      expect(
        validate(buildForm({ sequence: "99" })).valid,
      ).toBe(true)
    })

    it.each(["-1", "100", "x", "1.5"])(
      "rejects %j",
      (sequence) => {
        expect(errorsOf(buildForm({ sequence }))).toEqual({
          sequence:
            "Enter an order from 0 between 0 and 99.",
        })
      },
    )
  })

  describe("playerSlugs", () => {
    it("accepts no players", () => {
      expect(
        validate(buildForm({ playerSlugs: [] })),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({ playerSlugs: [] }),
      })
    })

    it("accepts several known players, keeping the order", () => {
      expect(
        validate(
          buildForm({
            playerSlugs: ["shusaku", "lee-sedol"],
          }),
        ),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          playerSlugs: ["shusaku", "lee-sedol"],
        }),
      })
    })

    it("removes duplicates", () => {
      expect(
        validate(
          buildForm({
            playerSlugs: [
              "shusaku",
              "shusaku",
              "lee-sedol",
            ],
          }),
        ),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          playerSlugs: ["shusaku", "lee-sedol"],
        }),
      })
    })

    it("rejects a player who is not in the Hall", () => {
      expect(
        errorsOf(
          buildForm({ playerSlugs: ["shusaku", "ghost"] }),
        ),
      ).toEqual({
        playerSlugs:
          "Choose only players who are in the Hall.",
      })
    })
  })

  it("keeps the featured flag as given", () => {
    expect(validate(buildForm({ featured: true }))).toEqual(
      {
        valid: true,
        draft: expect.objectContaining({ featured: true }),
      },
    )
  })

  it("reports every error at once", () => {
    expect(
      Object.keys(
        errorsOf(
          buildForm({
            name: "",
            year: "x",
            hook: "",
            playerSlugs: ["ghost"],
          }),
        ),
      ).sort(),
    ).toEqual(["hook", "name", "playerSlugs", "year"])
  })
})
