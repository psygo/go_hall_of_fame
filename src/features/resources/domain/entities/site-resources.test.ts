import { describe, expect, it } from "vitest"

import { validateSiteResourcesForm } from "./site-resources"

describe("validateSiteResourcesForm", () => {
  it("returns the cleaned links as the draft", () => {
    expect(
      validateSiteResourcesForm({
        resources: [
          {
            title: "T",
            url: " https://a.example ",
            description: " A ",
          },
          { title: "", url: "", description: "" },
          { title: "T", url: "/b", description: "" },
        ],
      }),
    ).toEqual({
      valid: true,
      draft: [
        {
          title: "T",
          url: "https://a.example",
          description: "A",
        },
        { title: "T", url: "/b", description: null },
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
          {
            title: "T",
            url: "http://a.example",
            description: "",
          },
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
