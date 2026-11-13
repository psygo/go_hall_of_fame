import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"

import type { FeedbackSubmission } from "../../domain/entities/feedback"
import { createFeedbackState } from "./feedback-state"

function buildState(submission: FeedbackSubmission) {
  const submit = vi.fn(async () => submission)
  return {
    state: createFeedbackState({
      submitFeedback: { call: submit },
    }),
    submit,
  }
}

function formWith(fields: Record<string, string>) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value)
  }
  return formData
}

const fields = { email: "a@b.example", description: "Hi" }

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe("submitFeedbackForm", () => {
  it("pretends to accept and skips the use case when the honeypot is filled", async () => {
    const { state, submit } = buildState({
      status: "accepted",
    })

    expect(
      await state.submitFeedbackForm(
        formWith({
          ...fields,
          website: "http://spam.example",
        }),
      ),
    ).toEqual({ status: "accepted" })
    expect(submit).not.toHaveBeenCalled()
  })

  it("passes the fields and returns accepted", async () => {
    const { state, submit } = buildState({
      status: "accepted",
    })

    expect(
      await state.submitFeedbackForm(
        formWith({ ...fields, website: "" }),
      ),
    ).toEqual({ status: "accepted" })
    expect(submit).toHaveBeenCalledWith({ draft: fields })
  })

  it("reads missing fields as empty strings", async () => {
    const { state, submit } = buildState({
      status: "accepted",
    })

    await state.submitFeedbackForm(new FormData())

    expect(submit).toHaveBeenCalledWith({
      draft: { email: "", description: "" },
    })
  })

  it("keeps the entered values when invalid", async () => {
    const errors = { email: "Enter a valid email address." }
    const { state } = buildState({
      status: "invalid",
      errors,
    })

    expect(
      await state.submitFeedbackForm(formWith(fields)),
    ).toEqual({
      status: "invalid",
      errors,
      values: fields,
    })
  })

  it("logs only the error name and returns failed with the values", async () => {
    const error = new Error("insert a@b.example failed")
    const { state } = buildState({
      status: "failed",
      error,
    })

    expect(
      await state.submitFeedbackForm(formWith(fields)),
    ).toEqual({
      status: "failed",
      values: fields,
    })
    expect(console.error).toHaveBeenCalledWith(
      "Feedback could not be saved:",
      "Error",
    )
  })
})
