import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { TimelineEvent } from "../entities/timeline-event"
import type { TimelineRepository } from "../repositories/timeline-repository"
import { ListTimelineEvents } from "./list-timeline-events"

describe("ListTimelineEvents", () => {
  it("returns the events of the repository", async () => {
    const events: TimelineEvent[] = [
      {
        id: 1,
        year: "1612",
        title: "Founded",
        text: "Text",
        games: [],
        players: [],
        contributors: [],
        isDraft: false,
      },
    ]
    const repository: TimelineRepository = {
      findById: vi.fn(),
      listGameOptions: vi.fn(),
      listPlayerOptions: vi.fn(),
      listContributorOptions: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      reorder: vi.fn(),
      listAll: vi.fn(async () => succeed(events)),
    }

    expect(
      await new ListTimelineEvents(repository).call(),
    ).toEqual(succeed(events))
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))
    const repository: TimelineRepository = {
      findById: vi.fn(),
      listGameOptions: vi.fn(),
      listPlayerOptions: vi.fn(),
      listContributorOptions: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      reorder: vi.fn(),
      listAll: vi.fn(async () => failure),
    }

    expect(
      await new ListTimelineEvents(repository).call(),
    ).toBe(failure)
  })
})
