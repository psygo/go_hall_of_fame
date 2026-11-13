import { describe, expect, it } from "vitest"

import {
  FEEDBACK_LIMITS,
  hasFeedbackErrors,
  normalizeFeedbackDraft,
  validateFeedbackDraft,
} from "./feedback"

const valid = { email: "a@b.example", description: "Nice" }

describe("normalizeFeedbackDraft", () => {
  it("trims both fields", () => {
    expect(
      normalizeFeedbackDraft({
        email: "  a@b.example ",
        description: "\n Nice \n",
      }),
    ).toEqual(valid)
  })
})

describe("validateFeedbackDraft", () => {
  it("accepts a valid draft", () => {
    expect(validateFeedbackDraft(valid)).toEqual({})
  })

  it.each([
    "",
    "plain",
    "a@b",
    "a@@b.example",
    "a b@c.example",
    "a@b..example",
    "@b.example",
    "a@b.com?bcc=x@y.z",
    "a%b@c.com",
    "a/b@c.com",
    "a&b@c.com",
    "a@b.com#x",
    "a@b_c.com",
    'a"b@c.com',
  ])("rejects the email %j", (email) => {
    expect(
      validateFeedbackDraft({ ...valid, email }).email,
    ).toBe("Enter a valid email address.")
  })

  it.each([
    "first.last+tag_1@sub-domain.example.com",
    "A-B@c.io",
  ])("accepts the plain address %j", (email) => {
    expect(
      validateFeedbackDraft({ ...valid, email }),
    ).toEqual({})
  })

  it("rejects an email over the limit even when well formed", () => {
    const email = `${"a".repeat(FEEDBACK_LIMITS.email)}@b.example`

    expect(
      validateFeedbackDraft({ ...valid, email }).email,
    ).toBe("Enter a valid email address.")
  })

  it("accepts an email at the limit", () => {
    const local = "a".repeat(
      FEEDBACK_LIMITS.email - "@b.example".length,
    )

    expect(
      validateFeedbackDraft({
        ...valid,
        email: `${local}@b.example`,
      }),
    ).toEqual({})
  })

  it("requires a description", () => {
    expect(
      validateFeedbackDraft({ ...valid, description: "" }),
    ).toEqual({ description: "Write your feedback." })
  })

  it("accepts the description limit and rejects one over", () => {
    const limit = FEEDBACK_LIMITS.description

    expect(
      validateFeedbackDraft({
        ...valid,
        description: "a".repeat(limit),
      }),
    ).toEqual({})
    expect(
      validateFeedbackDraft({
        ...valid,
        description: "a".repeat(limit + 1),
      }),
    ).toEqual({
      description: `Use at most ${limit} characters.`,
    })
  })

  it("reports both errors at once", () => {
    expect(
      Object.keys(
        validateFeedbackDraft({
          email: "x",
          description: "",
        }),
      ),
    ).toEqual(["email", "description"])
  })
})

describe("hasFeedbackErrors", () => {
  it("tells whether any error is present", () => {
    expect(hasFeedbackErrors({})).toBe(false)
    expect(hasFeedbackErrors({ email: "bad" })).toBe(true)
  })
})
