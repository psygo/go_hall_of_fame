import { describe, expect, it } from "vitest"

import { LOCALES } from "@/core/locales"

import { MESSAGES } from "./index"

function flatten(
  value: unknown,
  prefix = "",
): [string, unknown][] {
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, child]) =>
      flatten(child, prefix ? `${prefix}.${key}` : key),
    )
  }
  return [[prefix, value]]
}

const englishKeys = flatten(MESSAGES.en)
  .map(([key]) => key)
  .sort()

describe("MESSAGES", () => {
  it.each(LOCALES.map((locale) => locale.code))(
    "%s has the same keys as English and no empty text",
    (code) => {
      const entries = flatten(MESSAGES[code])

      expect(entries.map(([key]) => key).sort()).toEqual(
        englishKeys,
      )
      for (const [key, text] of entries) {
        expect(
          typeof text === "string" && text.trim() !== "",
          key,
        ).toBe(true)
      }
    },
  )
})
