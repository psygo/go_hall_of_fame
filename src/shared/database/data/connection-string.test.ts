import { describe, expect, it } from "vitest"

import { withExplicitSslMode } from "./connection-string"

const base = "postgres://user:pw@host.example:5432/db"

describe("withExplicitSslMode", () => {
  it.each(["require", "prefer", "verify-ca"])(
    "names verify-full instead of %s",
    (mode) => {
      const result = withExplicitSslMode(
        `${base}?sslmode=${mode}`,
      )

      expect(
        new URL(result).searchParams.get("sslmode"),
      ).toBe("verify-full")
    },
  )

  it("keeps the other parameters", () => {
    const result = withExplicitSslMode(
      `${base}?sslmode=require&connect_timeout=10`,
    )

    expect(
      new URL(result).searchParams.get("connect_timeout"),
    ).toBe("10")
  })

  it.each(["verify-full", "disable"])(
    "leaves sslmode=%s alone",
    (mode) => {
      const url = `${base}?sslmode=${mode}`

      expect(withExplicitSslMode(url)).toBe(url)
    },
  )

  it("leaves a URL without sslmode alone", () => {
    expect(withExplicitSslMode(base)).toBe(base)
  })

  it("returns a string that is not a URL unchanged", () => {
    expect(withExplicitSslMode("not a url")).toBe(
      "not a url",
    )
  })
})
