import { describe, expect, it } from "vitest"

import { resolveSiteUrl } from "./site-url"

describe("resolveSiteUrl", () => {
  it("uses SITE_URL and strips trailing slashes", () => {
    expect(
      resolveSiteUrl(
        { SITE_URL: " https://hall.example// " },
        true,
      ),
    ).toBe("https://hall.example")
  })

  it("prefers SITE_URL over the Vercel host", () => {
    expect(
      resolveSiteUrl(
        {
          SITE_URL: "https://a.example",
          VERCEL_PROJECT_PRODUCTION_URL: "b.vercel.app",
        },
        true,
      ),
    ).toBe("https://a.example")
  })

  it("ignores a malformed SITE_URL and falls through", () => {
    expect(
      resolveSiteUrl(
        {
          SITE_URL: "not a url",
          VERCEL_PROJECT_PRODUCTION_URL: "b.vercel.app",
        },
        true,
      ),
    ).toBe("https://b.vercel.app")
    expect(
      resolveSiteUrl({ SITE_URL: "nope" }, true),
    ).toBeNull()
  })

  it("uses the Vercel production host", () => {
    expect(
      resolveSiteUrl(
        { VERCEL_PROJECT_PRODUCTION_URL: "b.vercel.app" },
        false,
      ),
    ).toBe("https://b.vercel.app")
  })

  it("falls back to localhost in development and null in production", () => {
    expect(resolveSiteUrl({}, false)).toBe(
      "http://localhost:3000",
    )
    expect(
      resolveSiteUrl({ SITE_URL: "" }, true),
    ).toBeNull()
  })
})
