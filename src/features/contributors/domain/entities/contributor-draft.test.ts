import { describe, expect, it } from "vitest"

import type { Contributor } from "./contributor"
import {
  CONTRIBUTOR_LIMITS,
  DEFAULT_PHOTO_POSITION,
  validateContributorForm,
  type ContributorForm,
} from "./contributor-draft"

function buildContributor(slug: string): Contributor {
  return {
    slug,
    name: slug,
    kind: "person",
    role: "Role",
    birthYear: 1900,
    period: "",
    bio: "Bio",
    photoUrl: null,
    photoPosition: "50% 50%",
    isDraft: false,
  }
}

const existing = [
  buildContributor("kgs"),
  buildContributor("demis-hassabis"),
]

function buildForm(
  overrides: Partial<ContributorForm> = {},
): ContributorForm {
  return {
    slug: "fan-hui",
    name: "Fan Hui",
    kind: "person",
    role: "Played AlphaGo first",
    birthYear: "1900",
    period: "2015",
    bio: "A European champion.",
    photoUrl: "/portraits/fan-hui.webp",
    photoPosition: "40% 20%",
    isDraft: false,
    ...overrides,
  }
}

function validate(
  form: ContributorForm,
  originalSlug: string | null = null,
) {
  return validateContributorForm(form, {
    existing,
    originalSlug,
  })
}

function errorsOf(
  form: ContributorForm,
  originalSlug: string | null = null,
) {
  const result = validate(form, originalSlug)
  if (result.valid) throw new Error("expected invalid")
  return result.errors
}

describe("validateContributorForm", () => {
  it("accepts a valid form and returns the draft", () => {
    expect(validate(buildForm())).toEqual({
      valid: true,
      draft: {
        slug: "fan-hui",
        name: "Fan Hui",
        kind: "person",
        role: "Played AlphaGo first",
        birthYear: 1900,
        period: "2015",
        bio: "A European champion.",
        photoUrl: "/portraits/fan-hui.webp",
        photoPosition: "40% 20%",
        isDraft: false,
      },
    })
  })

  it("trims every text field", () => {
    const result = validate(
      buildForm({
        slug: " fan-hui ",
        name: " Fan Hui ",
        role: " Role ",
        period: " 2015 ",
        bio: "\n Bio \n",
        photoUrl: " /p.webp ",
      }),
    )

    expect(result).toEqual({
      valid: true,
      draft: expect.objectContaining({
        slug: "fan-hui",
        name: "Fan Hui",
        role: "Role",
        period: "2015",
        bio: "Bio",
        photoUrl: "/p.webp",
      }),
    })
  })

  it("keeps the draft flag", () => {
    expect(validate(buildForm({ isDraft: true }))).toEqual({
      valid: true,
      draft: expect.objectContaining({ isDraft: true }),
    })
  })

  describe("slug", () => {
    it("defaults to the slugified name when blank", () => {
      expect(validate(buildForm({ slug: "" }))).toEqual({
        valid: true,
        draft: expect.objectContaining({ slug: "fan-hui" }),
      })
    })

    it("errors when blank and the name has no Latin letters", () => {
      expect(
        errorsOf(buildForm({ slug: "", name: "樊麾" }))
          .slug,
      ).toMatch(/lowercase letters/)
    })

    it.each(["Fan Hui", "-fan", "fan-", "fan_hui", "FAN"])(
      "rejects the malformed slug %j",
      (slug) => {
        expect(errorsOf(buildForm({ slug })).slug).toMatch(
          /lowercase letters/,
        )
      },
    )

    it("rejects the reserved slug new", () => {
      expect(
        errorsOf(buildForm({ slug: "new" })).slug,
      ).toMatch(/reserved/)
    })

    it("rejects a slug another contributor has", () => {
      expect(
        errorsOf(buildForm({ slug: "kgs" })).slug,
      ).toBe("Another contributor already uses this slug.")
    })

    it("lets the contributor being edited keep its slug", () => {
      expect(
        validate(buildForm({ slug: "kgs" }), "kgs").valid,
      ).toBe(true)
    })

    it("rejects taking another contributor's slug while editing", () => {
      expect(
        errorsOf(
          buildForm({ slug: "kgs" }),
          "demis-hassabis",
        ).slug,
      ).toBe("Another contributor already uses this slug.")
    })
  })

  describe("kind", () => {
    it.each(["person", "organization"])(
      "accepts %s",
      (kind) => {
        expect(validate(buildForm({ kind })).valid).toBe(
          true,
        )
      },
    )

    it.each(["", "robot", "Person"])(
      "rejects %j",
      (kind) => {
        expect(errorsOf(buildForm({ kind })).kind).toBe(
          "Choose person, organization or entity.",
        )
      },
    )
  })

  describe.each([
    ["name", CONTRIBUTOR_LIMITS.name],
    ["role", CONTRIBUTOR_LIMITS.role],
    ["bio", CONTRIBUTOR_LIMITS.bio],
  ] as const)("%s", (field, limit) => {
    it("is required", () => {
      expect(
        errorsOf(buildForm({ [field]: "  " }))[field],
      ).toMatch(/^Enter /)
    })

    it("accepts the limit and rejects one over", () => {
      const slug = { slug: "fan-hui" }

      expect(
        validate(
          buildForm({
            ...slug,
            [field]: "a".repeat(limit),
          }),
        ).valid,
      ).toBe(true)
      expect(
        errorsOf(
          buildForm({
            ...slug,
            [field]: "a".repeat(limit + 1),
          }),
        )[field],
      ).toBe(`Use at most ${limit} characters.`)
    })
  })

  describe("birthYear", () => {
    it("is kept as a number, trimmed", () => {
      expect(
        validate(buildForm({ birthYear: " 1829 " })),
      ).toEqual({
        valid: true,
        draft: expect.objectContaining({ birthYear: 1829 }),
      })
    })

    it.each(["1", "2999"])(
      "accepts the boundary %s",
      (birthYear) => {
        expect(
          validate(buildForm({ birthYear })).valid,
        ).toBe(true)
      },
    )

    it.each(["", "0", "3000", "-5", "abc", "18.5"])(
      "rejects %j",
      (birthYear) => {
        expect(errorsOf(buildForm({ birthYear }))).toEqual({
          birthYear:
            "Enter the year of birth or founding, between 1 and 2999.",
        })
      },
    )
  })

  describe("period", () => {
    it("is optional", () => {
      expect(
        validate(buildForm({ period: "" })).valid,
      ).toBe(true)
    })

    it("accepts the limit and rejects one over", () => {
      const limit = CONTRIBUTOR_LIMITS.period

      expect(
        validate(buildForm({ period: "a".repeat(limit) }))
          .valid,
      ).toBe(true)
      expect(
        errorsOf(
          buildForm({ period: "a".repeat(limit + 1) }),
        ).period,
      ).toBe(`Use at most ${limit} characters.`)
    })
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
      expect(
        errorsOf(buildForm({ photoUrl })).photoUrl,
      ).toMatch(/Use a path/)
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
      "1000% 50%",
      "-5% 50%",
      "50% 50% 50%",
      "50.5% 50%",
    ])("rejects %j", (photoPosition) => {
      expect(
        errorsOf(buildForm({ photoPosition }))
          .photoPosition,
      ).toBe("Use two percentages such as 50% 20%.")
    })
  })

  it("reports every error at once", () => {
    expect(
      Object.keys(
        errorsOf({
          slug: "BAD",
          name: "",
          kind: "x",
          role: "",
          birthYear: "x",
          period: "a".repeat(41),
          bio: "",
          photoUrl: "javascript:x",
          photoPosition: "x",
          isDraft: false,
        }),
      ).sort(),
    ).toEqual(
      [
        "bio",
        "birthYear",
        "kind",
        "name",
        "period",
        "photoPosition",
        "photoUrl",
        "role",
        "slug",
      ].sort(),
    )
  })
})
