import { describe, expect, it } from "vitest"

import { validateSiteResourcesForm } from "./site-resources"

describe("validateSiteResourcesForm", () => {
  it("returns the cleaned links as the draft", () => {
    expect(
      validateSiteResourcesForm({
        resources: [
          {
            url: " https://a.example ",
            description: " A ",
          },
          { url: "", description: "" },
          { url: "/b", description: "" },
        ],
      }),
    ).toEqual({
      valid: true,
      draft: [
        { url: "https://a.example", description: "A" },
        { url: "/b", description: null },
      ],
    })
  })

  it("accepts an empty list", () => {
    expect(
      validateSiteResourcesForm({ resources: [] }),
    ).toEqual({
      valid: true,
      draft: [],
    })
  })

  it("reports a problem under the resources key", () => {
    expect(
      validateSiteResourcesForm({
        resources: [
          { url: "http://a.example", description: "" },
        ],
      }),
    ).toEqual({
      valid: false,
      errors: {
        resources: expect.stringMatching(
          /not a valid link/,
        ),
      },
    })
  })
})
