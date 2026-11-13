import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { TimelineRepository } from "../repositories/timeline-repository"
import { SaveTimelineEvent } from "./save-timeline-event"

const form = {
  year: "1612",
  title: " The Four Houses ",
  text: " Go gets state backing. ",
  gameSlug: "",
}

function buildRepository(
  overrides: Partial<TimelineRepository> = {},
): TimelineRepository {
  return {
    listAll: vi.fn(),
    findById: vi.fn(),
    listGameOptions: vi.fn(async () =>
      succeed([
        { slug: "alphago-game-4", name: "AlphaGo" },
      ]),
    ),
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
        gameSlug: null,
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
  it("validates the game link against the options", async () => {
    const repository = buildRepository()

    expect(
      await new SaveTimelineEvent(repository).call({
        id: null,
        form: { ...form, gameSlug: "alphago-game-4" },
      }),
    ).toEqual({ status: "saved" })
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        gameSlug: "alphago-game-4",
      }),
      null,
    )

    expect(
      await new SaveTimelineEvent(repository).call({
        id: null,
        form: { ...form, gameSlug: "ghost" },
      }),
    ).toEqual({
      status: "invalid",
      errors: {
        gameSlug: "Choose a game that is in the Hall.",
      },
    })
  })

  it("returns failed without saving when the options cannot be listed", async () => {
    const error = new Error("db down")
    const repository = buildRepository({
      listGameOptions: vi.fn(async () => fail(error)),
    })

    expect(
      await new SaveTimelineEvent(repository).call({
        id: null,
        form,
      }),
    ).toEqual({ status: "failed", error })
    expect(repository.save).not.toHaveBeenCalled()
  })
})
