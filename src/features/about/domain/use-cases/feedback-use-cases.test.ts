import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { FeedbackRecord } from "../entities/feedback-record"
import type { FeedbackRepository } from "../repositories/feedback-repository"
import { DeleteFeedback } from "./delete-feedback"
import { ListFeedback } from "./list-feedback"
import { SetFeedbackRead } from "./set-feedback-read"

function build(
  overrides: Partial<FeedbackRepository>,
): FeedbackRepository {
  return {
    submit: vi.fn(),
    listAll: vi.fn(),
    setRead: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

describe("ListFeedback", () => {
  it("returns the records of the repository", async () => {
    const records: FeedbackRecord[] = [
      {
        id: 1,
        email: "a@b.example",
        description: "Hi",
        isRead: false,
        createdAt: new Date(0),
      },
    ]
    const repository = build({
      listAll: vi.fn(async () => succeed(records)),
    })

    expect(
      await new ListFeedback(repository).call(),
    ).toEqual(succeed(records))
  })

  it("propagates a failure", async () => {
    const failure = fail(new Error("db down"))
    const repository = build({
      listAll: vi.fn(async () => failure),
    })

    expect(await new ListFeedback(repository).call()).toBe(
      failure,
    )
  })
})

describe("SetFeedbackRead", () => {
  it("passes the id and flag to the repository", async () => {
    const setRead = vi.fn(async () => succeed(undefined))

    const result = await new SetFeedbackRead(
      build({ setRead }),
    ).call({
      id: 4,
      isRead: true,
    })

    expect(setRead).toHaveBeenCalledWith(4, true)
    expect(result).toEqual(succeed(undefined))
  })

  it("propagates a failure", async () => {
    const failure = fail(new Error("db down"))

    expect(
      await new SetFeedbackRead(
        build({ setRead: vi.fn(async () => failure) }),
      ).call({ id: 4, isRead: false }),
    ).toBe(failure)
  })
})

describe("DeleteFeedback", () => {
  it("deletes by id", async () => {
    const remove = vi.fn(async () => succeed(undefined))

    const result = await new DeleteFeedback(
      build({ delete: remove }),
    ).call({
      id: 9,
    })

    expect(remove).toHaveBeenCalledWith(9)
    expect(result).toEqual(succeed(undefined))
  })

  it("propagates a failure", async () => {
    const failure = fail(new Error("db down"))

    expect(
      await new DeleteFeedback(
        build({ delete: vi.fn(async () => failure) }),
      ).call({ id: 9 }),
    ).toBe(failure)
  })
})
