import { describe, expect, it } from "vitest"

import {
  DEFAULT_LOCALE,
  directionOf,
  isLocale,
  pickLocale,
  resolveLocale,
} from "./locales"

describe("isLocale", () => {
  it("accepts supported codes only", () => {
    expect(isLocale("pt")).toBe(true)
    expect(isLocale("xx")).toBe(false)
    expect(isLocale("pt-BR")).toBe(false)
    expect(isLocale(null)).toBe(false)
    expect(isLocale(undefined)).toBe(false)
  })
})

describe("directionOf", () => {
  it("is rtl for Arabic and ltr otherwise", () => {
    expect(directionOf("ar")).toBe("rtl")
    expect(directionOf("en")).toBe("ltr")
    expect(directionOf("ja")).toBe("ltr")
  })
})

describe("pickLocale", () => {
  it.each([null, undefined, "", "*", "!!;;,,", "xx-YY"])(
    "falls back to English for %s",
    (header) => {
      expect(pickLocale(header)).toBe(DEFAULT_LOCALE)
    },
  )

  it("reduces a region tag to its language", () => {
    expect(pickLocale("pt-BR")).toBe("pt")
    expect(pickLocale("zh-Hant-TW")).toBe("zh")
  })

  it("is case-insensitive", () => {
    expect(pickLocale("FR-ca")).toBe("fr")
  })

  it("prefers the highest quality", () => {
    expect(pickLocale("de;q=0.5,fr;q=0.9,en;q=0.1")).toBe(
      "fr",
    )
  })

  it("keeps header order for equal quality", () => {
    expect(pickLocale("es,fr")).toBe("es")
  })

  it("skips unsupported languages and the wildcard", () => {
    expect(pickLocale("xx,*;q=0.8,it;q=0.7")).toBe("it")
  })

  it("ignores languages with quality 0 or a garbage quality", () => {
    expect(pickLocale("fr;q=0,de;q=abc")).toBe(
      DEFAULT_LOCALE,
    )
    expect(pickLocale("fr;q=0,ko;q=0.2")).toBe("ko")
  })
})

describe("resolveLocale", () => {
  it("lets a valid cookie win", () => {
    expect(resolveLocale("ja", "fr")).toBe("ja")
  })

  it("falls back to the header when the cookie is invalid or missing", () => {
    expect(resolveLocale("klingon", "fr")).toBe("fr")
    expect(resolveLocale(null, "de")).toBe("de")
    expect(resolveLocale(undefined, undefined)).toBe("en")
  })
})
