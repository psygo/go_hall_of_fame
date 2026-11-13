import { describe, expect, it } from "vitest"

import type { Player } from "./player"
import {
  DEFAULT_PHOTO_POSITION,
  nextInductionNumber,
  PLAYER_LIMITS,
  validatePlayerForm,
  type PlayerForm,
} from "./player-draft"

function buildPlayer(
  slug: string,
  inductionNumber: number,
): Player {
  return {
    slug,
    inductionNumber,
    name: slug,
    nativeName: slug,
    country: "Japan",
    years: "1900-1950",
    distinction: "Master",
    bio: "Bio",
    photoUrl: null,
    photoPosition: "50% 50%",
    tags: [],
  }
}

const existing = [
  buildPlayer("shusaku", 1),
  buildPlayer("lee-sedol", 2),
]

function buildForm(
  overrides: Partial<PlayerForm> = {},
): PlayerForm {
  return {
    slug: "gu-li",
    name: "Gu Li",
    nativeName: "古力",
    country: "China",
    years: "1983-",
    distinction: "Ing Cup",
    bio: "A bold fighter.",
    photoUrl: "/portraits/gu-li.webp",
    photoPosition: "40% 20%",
    inductionNumber: "3",
    tags: "",
    resources: [],
    ...overrides,
  }
}

function validate(
  form: PlayerForm,
  originalSlug: string | null = null,
  players: readonly Player[] = existing,
) {
  return validatePlayerForm(form, {
    existing: players,
    originalSlug,
  })
}

function errorsOf(
  form: PlayerForm,
  originalSlug: string | null = null,
) {
  const result = validate(form, originalSlug)
  if (result.valid) throw new Error("expected invalid")
  return result.errors
}

describe("nextInductionNumber", () => {
  it("is one for no players", () => {
    expect(nextInductionNumber([])).toBe(1)
  })

  it("is one past the highest number", () => {
    expect(
      nextInductionNumber([
        buildPlayer("a", 2),
        buildPlayer("b", 9),
        buildPlayer("c", 4),
      ]),
    ).toBe(10)
  })
})

describe("validatePlayerForm", () => {
  it("accepts a valid form and returns the draft", () => {
    expect(validate(buildForm())).toEqual({
      valid: true,
      draft: {
        slug: "gu-li",
        name: "Gu Li",
        nativeName: "古力",
        country: "China",
        years: "1983-",
        distinction: "Ing Cup",
        bio: "A bold fighter.",
        photoUrl: "/portraits/gu-li.webp",
        photoPosition: "40% 20%",
        inductionNumber: 3,
        tags: [],
        resources: [],
      },
    })
  })

  it("trims every text field", () => {
    const result = validate(
      buildForm({
        slug: " gu-li ",
        name: " Gu Li ",
        nativeName: " 古力 ",
        years: " 1983- ",
        distinction: " Ing Cup ",
        bio: " Bio ",
        photoUrl: " /portraits/a.webp ",
        photoPosition: " 40% 20% ",
        inductionNumber: " 3 ",
      }),
    )

    expect(result).toEqual({
      valid: true,
      draft: expect.objectContaining({
        slug: "gu-li",
        name: "Gu Li",
        nativeName: "古力",
        years: "1983-",
        distinction: "Ing Cup",
        bio: "Bio",
        photoUrl: "/portraits/a.webp",
        photoPosition: "40% 20%",
        inductionNumber: 3,
      }),
    })
  })

  describe("slug", () => {
    it("defaults to the slugified name when blank", () => {
      expect(
        validate(
          buildForm({ slug: "  ", name: "Cho Chikun" }),
        ),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          slug: "cho-chikun",
        }),
      })
    })

    it("errors when blank and the name has no Latin letters", () => {
      expect(
        errorsOf(buildForm({ slug: "", name: "古力" }))
          .slug,
      ).toMatch(/lowercase letters/)
    })

    it.each(["Gu Li", "-gu", "gu-", "gu_li", "GU"])(
      "rejects the malformed slug %j",
      (slug) => {
        expect(errorsOf(buildForm({ slug })).slug).toMatch(
          /lowercase letters/,
        )
      },
    )

    it("rejects the reserved slug new", () => {
      expect(errorsOf(buildForm({ slug: "new" }))).toEqual({
        slug: "“new” is reserved.",
      })
    })

    it("rejects a slug another player has", () => {
      expect(
        errorsOf(buildForm({ slug: "shusaku" })),
      ).toEqual({
        slug: "Another player already uses this slug.",
      })
    })

    it("allows the player being edited to keep its slug", () => {
      expect(
        validate(
          buildForm({
            slug: "shusaku",
            inductionNumber: "1",
          }),
          "shusaku",
        ).valid,
      ).toBe(true)
    })

    it("rejects taking another player's slug while editing", () => {
      expect(
        errorsOf(
          buildForm({
            slug: "lee-sedol",
            inductionNumber: "1",
          }),
          "shusaku",
        ).slug,
      ).toBe("Another player already uses this slug.")
    })

    it("accepts 80 characters and rejects 81", () => {
      expect(
        validate(buildForm({ slug: "a".repeat(80) })).valid,
      ).toBe(true)
      expect(
        errorsOf(buildForm({ slug: "a".repeat(81) })).slug,
      ).toMatch(/lowercase letters/)
    })
  })

  describe.each([
    ["name", "a name", PLAYER_LIMITS.name],
    [
      "nativeName",
      "the name in its own script",
      PLAYER_LIMITS.nativeName,
    ],
    ["years", "the years", PLAYER_LIMITS.years],
    [
      "distinction",
      "a distinction",
      PLAYER_LIMITS.distinction,
    ],
    ["bio", "a biography", PLAYER_LIMITS.bio],
  ] as const)("%s", (field, what, limit) => {
    it("is required", () => {
      expect(
        errorsOf(buildForm({ [field]: "   " }))[field],
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

  describe("country", () => {
    it.each(["Japan", "China", "Korea", "Others"])(
      "accepts %s",
      (country) => {
        expect(validate(buildForm({ country })).valid).toBe(
          true,
        )
      },
    )

    it.each(["France", "", "japan"])(
      "rejects %j",
      (country) => {
        expect(errorsOf(buildForm({ country }))).toEqual({
          country: "Choose Japan, China, Korea, Others.",
        })
      },
    )
  })

  describe("photoUrl", () => {
    it.each(["", "   "])(
      "turns a blank photo (%j) into null",
      (photoUrl) => {
        expect(validate(buildForm({ photoUrl }))).toEqual({
          valid: true,
          draft: expect.objectContaining({
            photoUrl: null,
          }),
        })
      },
    )

    it.each([
      "/portraits/a.webp",
      "https://example.com/a.webp",
    ])("accepts %s", (photoUrl) => {
      expect(validate(buildForm({ photoUrl })).valid).toBe(
        true,
      )
    })

    it.each([
      "javascript:alert(1)",
      "//evil.example/a.png",
      "http://example.com/a.png",
      "/portraits/my photo.webp",
    ])("rejects %s", (photoUrl) => {
      expect(errorsOf(buildForm({ photoUrl }))).toEqual({
        photoUrl:
          "Use a path such as /portraits/name.webp, or an https URL.",
      })
    })
  })

  describe("photoPosition", () => {
    it("defaults to the centre when blank", () => {
      expect(
        validate(buildForm({ photoPosition: " " })),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          photoPosition: DEFAULT_PHOTO_POSITION,
        }),
      })
    })

    it.each(["0% 0%", "100% 100%", "5% 50%"])(
      "accepts %s",
      (photoPosition) => {
        expect(
          validate(buildForm({ photoPosition })).valid,
        ).toBe(true)
      },
    )

    it.each([
      "center",
      "50 50",
      "50%50%",
      "50% 50",
      "1000% 50%",
      "-5% 50%",
      "50% 50% 50%",
      "50.5% 50%",
    ])("rejects %j", (photoPosition) => {
      expect(
        errorsOf(buildForm({ photoPosition })),
      ).toEqual({
        photoPosition:
          "Use two percentages such as 50% 20%.",
      })
    })
  })

  it("rejects percentages over 100", () => {
    expect(
      errorsOf(buildForm({ photoPosition: "999% 1%" })),
    ).toHaveProperty("photoPosition")
    expect(
      errorsOf(buildForm({ photoPosition: "101% 1%" })),
    ).toHaveProperty("photoPosition")
  })

  describe("inductionNumber", () => {
    it("defaults to the next number when blank", () => {
      expect(
        validate(buildForm({ inductionNumber: "" })),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          inductionNumber: 3,
        }),
      })
    })

    it("keeps the current number when blank on edit", () => {
      expect(
        validate(
          buildForm({
            inductionNumber: "",
            slug: "shusaku",
          }),
          "shusaku",
        ),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({
          inductionNumber: 1,
        }),
      })
    })

    it("accepts 1 and the maximum", () => {
      expect(
        validate(buildForm({ inductionNumber: "9999" }))
          .valid,
      ).toBe(true)
      expect(
        validate(
          buildForm({
            inductionNumber: "1",
            slug: "shusaku",
          }),
          "shusaku",
        ).valid,
      ).toBe(true)
    })

    it.each(["0", "10000", "-1", "abc", "2.5"])(
      "rejects %j",
      (inductionNumber) => {
        expect(
          errorsOf(buildForm({ inductionNumber })),
        ).toEqual({
          inductionNumber: `Enter a whole number from 1 to ${PLAYER_LIMITS.maxInductionNumber}.`,
        })
      },
    )

    it("rejects a number another player has", () => {
      expect(
        errorsOf(buildForm({ inductionNumber: "2" })),
      ).toEqual({
        inductionNumber:
          "Another player already has this number.",
      })
    })

    it("allows the player being edited to keep its number", () => {
      expect(
        validate(
          buildForm({
            slug: "lee-sedol",
            inductionNumber: "2",
          }),
          "lee-sedol",
        ).valid,
      ).toBe(true)
    })

    it("rejects taking another player's number while editing", () => {
      expect(
        errorsOf(
          buildForm({
            slug: "lee-sedol",
            inductionNumber: "1",
          }),
          "lee-sedol",
        ).inductionNumber,
      ).toBe("Another player already has this number.")
    })
  })

  it("reports every error at once", () => {
    const errors = errorsOf(
      buildForm({
        name: "",
        country: "x",
        bio: "",
        inductionNumber: "x",
      }),
    )

    expect(Object.keys(errors).sort()).toEqual([
      "bio",
      "country",
      "inductionNumber",
      "name",
    ])
  })
})

describe("validatePlayerForm tags", () => {
  function tagsOf(tags: string) {
    const result = validate(buildForm({ tags }))
    if (!result.valid) throw new Error("expected valid")
    return result.draft.tags
  }

  it("accepts blank tags as an empty list", () => {
    expect(tagsOf("")).toEqual([])
    expect(tagsOf(" , ")).toEqual([])
  })

  it("trims and removes repeated tags", () => {
    expect(tagsOf(" ko , Ko,  seki ")).toEqual([
      "ko",
      "seki",
    ])
  })

  it("rejects more than 8 tags under the tags key", () => {
    const tags = Array.from(
      { length: 9 },
      (_, i) => `t${i}`,
    )

    expect(
      errorsOf(buildForm({ tags: tags.join(",") })).tags,
    ).toBe("Use at most 8 tags.")
  })

  it("rejects a tag over 24 characters", () => {
    expect(
      errorsOf(buildForm({ tags: "x".repeat(25) })).tags,
    ).toMatch(/24 characters/)
  })
})

describe("validatePlayerForm resources", () => {
  it("returns the cleaned links in the draft", () => {
    expect(
      validate(
        buildForm({
          resources: [
            {
              title: "T",
              url: " https://example.com ",
              description: " Bio ",
            },
            { title: "", url: "", description: "" },
          ],
        }),
      ),
    ).toEqual({
      valid: true,
      draft: expect.objectContaining({
        resources: [
          {
            title: "T",
            url: "https://example.com",
            description: "Bio",
          },
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
              title: "T",
              url: "http://example.com",
              description: "",
            },
          ],
        }),
      ).resources,
    ).toMatch(/not a valid link/)
  })
})
