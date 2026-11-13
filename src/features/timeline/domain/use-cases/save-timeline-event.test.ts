import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { TimelineRepository } from "../repositories/timeline-repository"
import { SaveTimelineEvent } from "./save-timeline-event"

const form = {
  year: "1612",
  title: " The Four Houses ",
  text: " Go gets state backing. ",
}

function buildRepository(
  overrides: Partial<TimelineRepository> = {},
): TimelineRepository {
  return {
    listAll: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(async () => succeed(undefined)),
    delete: vi.fn(),
    ...overrides,
  }
}

describe("SaveTimelineEvent", () => {
  it("saves the trimmed draft with the given id", async () => {
    const repository = buildRepository()

    const result = await new SaveTimelineEvent(
      repository,
    ).call({ id: 4, form })

    expect(result).toEqual({ status: "saved" })
    expect(repository.save).toHaveBeenCalledWith(
      {
        year: 1612,
        title: "The Four Houses",
        text: "Go gets state backing.",
      },
      4,
    )
  })

  it("returns the errors without saving when the form is invalid", async () => {
    const repository = buildRepository()

    const result = await new SaveTimelineEvent(
      repository,
    ).call({ id: null, form: { ...form, title: "" } })

    expect(result).toEqual({
      status: "invalid",
      errors: expect.objectContaining({
        title: expect.any(String),
      }),
    })
    expect(repository.save).not.toHaveBeenCalled()
  })

  it("returns failed when the repository fails", async () => {
    const error = new Error("db down")
    const repository = buildRepository({
      save: vi.fn(async () => fail(error)),
    })

    const result = await new SaveTimelineEvent(
      repository,
    ).call({ id: null, form })

    expect(result).toEqual({ status: "failed", error })
  })
})
