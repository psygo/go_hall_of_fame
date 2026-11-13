import { describe, expect, it } from "vitest"

import {
  PAGE_IDS,
  PAGE_TEXT_DEFINITIONS,
  resolvePageTexts,
  toEditableTexts,
  validateSiteTextsForm,
} from "./page-text"

const home = PAGE_TEXT_DEFINITIONS.filter(
  (definition) => definition.page === "home",
)
const title = PAGE_TEXT_DEFINITIONS.find(
  (definition) => definition.key === "home.title",
)
if (title === undefined)
  throw new Error("home.title missing")

describe("PAGE_TEXT_DEFINITIONS", () => {
  it("has unique keys that start with their page id", () => {
    const keys = PAGE_TEXT_DEFINITIONS.map(({ key }) => key)

    expect(new Set(keys).size).toBe(keys.length)
    for (const definition of PAGE_TEXT_DEFINITIONS) {
      expect(
        definition.key.startsWith(`${definition.page}.`),
      ).toBe(true)
    }
  })

  it("has a page id for every definition and a definition for every page", () => {
    for (const definition of PAGE_TEXT_DEFINITIONS) {
      expect(PAGE_IDS).toContain(definition.page)
    }
    for (const page of PAGE_IDS) {
      expect(
        PAGE_TEXT_DEFINITIONS.some(
          (definition) => definition.page === page,
        ),
      ).toBe(true)
    }
  })

  it("has defaults that fit their own limit", () => {
    for (const definition of PAGE_TEXT_DEFINITIONS) {
      expect(
        definition.defaultValue.length,
      ).toBeGreaterThan(0)
      expect(
        definition.defaultValue.length,
      ).toBeLessThanOrEqual(definition.maxLength)
    }
  })
})

describe("resolvePageTexts", () => {
  it("returns the defaults of the page when nothing is saved", () => {
    const texts = resolvePageTexts("home", {})

    expect(Object.keys(texts)).toEqual(
      home.map(({ key }) => key),
    )
    expect(texts["home.title"]).toBe(title.defaultValue)
  })

  it("overlays the saved values over the defaults", () => {
    const texts = resolvePageTexts("home", {
      "home.title": "Custom",
    })

    expect(texts["home.title"]).toBe("Custom")
    expect(texts["home.intro"]).toBe(
      home.find(({ key }) => key === "home.intro")
        ?.defaultValue,
    )
  })

  it("ignores saved values of other pages and unknown keys", () => {
    const texts = resolvePageTexts("home", {
      "players.title": "Other",
      "home.unknown": "x",
    })

    expect(texts["players.title"]).toBeUndefined()
    expect(texts["home.unknown"]).toBeUndefined()
  })

  it("keeps a saved empty string, since it is not undefined", () => {
    expect(
      resolvePageTexts("home", { "home.title": "" })[
        "home.title"
      ],
    ).toBe("")
  })
})

describe("toEditableTexts", () => {
  it("lists every definition with its default when nothing is saved", () => {
    const editable = toEditableTexts({})

    expect(editable).toHaveLength(
      PAGE_TEXT_DEFINITIONS.length,
    )
    expect(editable[0]).toEqual({
      definition: PAGE_TEXT_DEFINITIONS[0],
      value: PAGE_TEXT_DEFINITIONS[0].defaultValue,
    })
  })

  it("uses the saved value where there is one", () => {
    const editable = toEditableTexts({
      "home.title": "Custom",
    })

    expect(
      editable.find(
        ({ definition }) => definition.key === "home.title",
      )?.value,
    ).toBe("Custom")
  })
})

describe("validateSiteTextsForm", () => {
  it("clears every key for an empty form", () => {
    const result = validateSiteTextsForm({})

    expect(result).toEqual({
      valid: true,
      draft: {
        set: {},
        clear: PAGE_TEXT_DEFINITIONS.map(({ key }) => key),
      },
    })
  })

  it("sets a changed value, trimmed, and clears the others", () => {
    const result = validateSiteTextsForm({
      "home.title": "  A new heading  ",
    })

    expect(result).toEqual({
      valid: true,
      draft: {
        set: { "home.title": "A new heading" },
        clear: PAGE_TEXT_DEFINITIONS.map(
          ({ key }) => key,
        ).filter((key) => key !== "home.title"),
      },
    })
  })

  it("clears a blank value", () => {
    const result = validateSiteTextsForm({
      "home.title": "   ",
    })

    expect(result).toEqual({
      valid: true,
      draft: expect.objectContaining({
        set: {},
        clear: expect.arrayContaining(["home.title"]),
      }),
    })
  })

  it("clears a value equal to the default, even with whitespace around it", () => {
    const result = validateSiteTextsForm({
      "home.title": ` ${title.defaultValue} `,
    })

    expect(result).toEqual({
      valid: true,
      draft: expect.objectContaining({
        set: {},
        clear: expect.arrayContaining(["home.title"]),
      }),
    })
  })

  it("ignores form keys that are not text definitions", () => {
    const result = validateSiteTextsForm({
      "evil.key": "x",
    })

    expect(result).toEqual({
      valid: true,
      draft: expect.objectContaining({ set: {} }),
    })
  })

  it("accepts a value of exactly the limit", () => {
    const value = "a".repeat(title.maxLength)

    expect(
      validateSiteTextsForm({ "home.title": value }),
    ).toEqual({
      valid: true,
      draft: expect.objectContaining({
        set: { "home.title": value },
      }),
    })
  })

  it("rejects a value over the limit, naming the key", () => {
    const result = validateSiteTextsForm({
      "home.title": "a".repeat(title.maxLength + 1),
    })

    expect(result).toEqual({
      valid: false,
      errors: {
        "home.title": `Use at most ${title.maxLength} characters.`,
      },
    })
  })

  it("measures the limit after trimming", () => {
    const value = ` ${"a".repeat(title.maxLength)} `

    expect(
      validateSiteTextsForm({ "home.title": value }).valid,
    ).toBe(true)
  })

  it("reports the errors of several keys at once", () => {
    const result = validateSiteTextsForm({
      "home.title": "a".repeat(1000),
      "players.title": "a".repeat(1000),
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(Object.keys(result.errors).sort()).toEqual([
        "home.title",
        "players.title",
      ])
    }
  })
})
