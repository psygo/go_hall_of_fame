import { describe, expect, it } from "vitest"

import type { Game, GamePlayerReference } from "./game"
import {
  GAME_LIMITS,
  isPlausibleSgf,
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
    description: "H",
    blackPlayerSlug: null,
    whitePlayerSlug: null,
    sgfUrl: null,
    hasUploadedSgf: false,
    highlightMove: null,
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
    description: "The wedge.",
    sgfUrl: "/sgf/game-4.sgf",
    sequence: "1",
    highlightMove: "",
    featured: false,
    sgfFileText: "",
    sgfFileTooLarge: false,
    removeSgf: false,
    blackPlayerSlug: "lee-sedol",
    whitePlayerSlug: "",
    resources: [],
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
        description: "The wedge.",
        sgfUrl: "/sgf/game-4.sgf",
        sequence: 1,
        highlightMove: null,
        featured: false,
        blackPlayerSlug: "lee-sedol",
        whitePlayerSlug: null,
        playerSlugs: ["lee-sedol"],
        sgf: { kind: "keep" },
        resources: [],
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
        description: " Hook ",
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
        description: "Hook",
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
    [
      "description",
      "a description",
      GAME_LIMITS.description,
    ],
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

  describe("highlightMove", () => {
    it("is null when blank", () => {
      expect(
        validate(buildForm({ highlightMove: "  " })),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          highlightMove: null,
        }),
      })
    })

    it("accepts 1 and the maximum, trimmed", () => {
      expect(
        validate(buildForm({ highlightMove: " 78 " })),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          highlightMove: 78,
        }),
      })
      for (const move of [
        1,
        GAME_LIMITS.maxHighlightMove,
      ]) {
        expect(
          validate(
            buildForm({ highlightMove: String(move) }),
          ).valid,
        ).toBe(true)
      }
    })

    it.each(["0", "-5", "1001", "x", "1.5"])(
      "rejects %j",
      (highlightMove) => {
        expect(
          errorsOf(buildForm({ highlightMove }))
            .highlightMove,
        ).toMatch(/between 1 and 1000/)
      },
    )
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

  describe("black and white player links", () => {
    it("accepts no links", () => {
      expect(
        validate(
          buildForm({
            blackPlayerSlug: "",
            whitePlayerSlug: "",
          }),
        ),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          blackPlayerSlug: null,
          whitePlayerSlug: null,
          playerSlugs: [],
        }),
      })
    })

    it("lists both players, Black first", () => {
      expect(
        validate(
          buildForm({
            blackPlayerSlug: "shusaku",
            whitePlayerSlug: "lee-sedol",
          }),
        ),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          playerSlugs: ["shusaku", "lee-sedol"],
        }),
      })
    })

    it("lists a player once when both sides are the same", () => {
      expect(
        validate(
          buildForm({
            blackPlayerSlug: "shusaku",
            whitePlayerSlug: "shusaku",
          }),
        ),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          playerSlugs: ["shusaku"],
        }),
      })
    })

    it("rejects a player who is not in the Hall, per side", () => {
      expect(
        errorsOf(
          buildForm({
            blackPlayerSlug: "ghost",
            whitePlayerSlug: "shusaku",
          }),
        ),
      ).toEqual({
        blackPlayerSlug:
          "Choose a player who is in the Hall.",
      })
      expect(
        errorsOf(buildForm({ whitePlayerSlug: "ghost" })),
      ).toEqual({
        whitePlayerSlug:
          "Choose a player who is in the Hall.",
      })
    })
  })

  describe("sgf file", () => {
    const sgf = "(;GM[1]SZ[19];B[pd])"

    it("keeps the stored SGF by default", () => {
      expect(validate(buildForm())).toEqual({
        valid: true,
        draft: expect.objectContaining({
          sgf: { kind: "keep" },
        }),
      })
    })

    it("replaces it with an uploaded text", () => {
      expect(
        validate(buildForm({ sgfFileText: sgf })),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          sgf: { kind: "replace", text: sgf },
        }),
      })
    })

    it("removes it when asked and no file is chosen", () => {
      expect(
        validate(buildForm({ removeSgf: true })),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          sgf: { kind: "remove" },
        }),
      })
    })

    it("lets a new file win over the remove flag", () => {
      expect(
        validate(
          buildForm({ sgfFileText: sgf, removeSgf: true }),
        ),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          sgf: { kind: "replace", text: sgf },
        }),
      })
    })

    it("treats a whitespace-only file as no file", () => {
      expect(
        validate(buildForm({ sgfFileText: "  \n" })),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          sgf: { kind: "keep" },
        }),
      })
    })

    it.each(["hello", "(GM[1])", "(;B[aa]"])(
      "rejects %j as not an SGF",
      (sgfFileText) => {
        expect(
          errorsOf(buildForm({ sgfFileText })).sgfFile,
        ).toMatch(/does not look like an SGF/)
      },
    )

    it("accepts leading whitespace before the tree", () => {
      expect(
        validate(buildForm({ sgfFileText: " \n( ;B[aa])" }))
          .valid,
      ).toBe(true)
    })

    it("reports a file the admin state flagged as too large", () => {
      expect(
        errorsOf(
          buildForm({
            sgfFileTooLarge: true,
            sgfFileText: "",
          }),
        ).sgfFile,
      ).toMatch(/too large/)
    })

    it("rejects unbalanced parentheses", () => {
      expect(
        errorsOf(buildForm({ sgfFileText: "(;B[aa]" }))
          .sgfFile,
      ).toMatch(/balanced parentheses/)
    })
  })

  describe("resources", () => {
    it("returns the cleaned links in the draft", () => {
      expect(
        validate(
          buildForm({
            resources: [
              {
                url: " https://example.com/a ",
                description: " A ",
              },
              { url: "", description: "" },
              { url: "/notes", description: "" },
            ],
          }),
        ),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          resources: [
            {
              url: "https://example.com/a",
              description: "A",
            },
            { url: "/notes", description: null },
          ],
        }),
      })
    })

    it("reports an unsafe link as a resources error", () => {
      expect(
        errorsOf(
          buildForm({
            resources: [
              {
                url: "javascript:alert(1)",
                description: "",
              },
            ],
          }),
        ).resources,
      ).toMatch(/not a valid link/)
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
            description: "",
            blackPlayerSlug: "ghost",
          }),
        ),
      ).sort(),
    ).toEqual([
      "blackPlayerSlug",
      "description",
      "name",
      "year",
    ])
  })
})

describe("isPlausibleSgf", () => {
  it.each([
    "(;GM[1];B[aa])",
    " \n( ;B[aa])",
    "(;B[aa](;W[bb])(;W[cc]))",
    "(;C[a smiley :) or (]B[aa])",
    "(;C[escaped \\] bracket )]B[aa])",
  ])("accepts %j", (text) => {
    expect(isPlausibleSgf(text)).toBe(true)
  })

  it.each([
    "",
    "hello",
    "(GM[1])",
    "(;B[aa]",
    "(;B[aa]))",
    "(;C[unclosed value)",
    "(;C[a \\])",
  ])("rejects %j", (text) => {
    expect(isPlausibleSgf(text)).toBe(false)
  })
})
