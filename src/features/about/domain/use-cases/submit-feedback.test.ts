import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { FeedbackRepository } from "../repositories/feedback-repository"
import { SubmitFeedback } from "./submit-feedback"

function build(
  overrides: Partial<FeedbackRepository> = {},
): FeedbackRepository {
  return {
    submit: vi.fn(async () => succeed(undefined)),
    listAll: vi.fn(),
    setRead: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

describe("SubmitFeedback", () => {
  it("returns the errors without calling the repository when invalid", async () => {
    const repository = build()

    const result = await new SubmitFeedback(
      repository,
    ).call({
      draft: { email: "nope", description: " " },
    })

    expect(result).toEqual({
      status: "invalid",
      errors: {
        email: "Enter a valid email address.",
        description: "Write your feedback.",
      },
    })
    expect(repository.submit).not.toHaveBeenCalled()
  })

  it("saves the trimmed draft and accepts", async () => {
    const repository = build()

    const result = await new SubmitFeedback(
      repository,
    ).call({
      draft: {
        email: " a@b.example ",
        description: " Hi ",
      },
    })

    expect(repository.submit).toHaveBeenCalledWith({
      email: "a@b.example",
      description: "Hi",
    })
    expect(result).toEqual({ status: "accepted" })
  })

  it("returns failed with the error when the repository fails", async () => {
    const error = new Error("db down")
    const repository = build({
      submit: vi.fn(async () => fail(error)),
    })

    expect(
      await new SubmitFeedback(repository).call({
        draft: { email: "a@b.example", description: "Hi" },
      }),
    ).toEqual({ status: "failed", error })
  })
})
