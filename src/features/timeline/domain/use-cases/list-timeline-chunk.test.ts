import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { TimelineEvent } from "../entities/timeline-event"
import { TIMELINE_CHUNK_SIZE } from "../entities/timeline-layout"
import type { TimelineRepository } from "../repositories/timeline-repository"
import { ListTimelineChunk } from "./list-timeline-chunk"

const eventIn = (year: number): TimelineEvent => ({
  id: year,
  year: String(year),
  title: `T${year}`,
  text: "x",
  games: [],
  players: [],
  contributors: [],
  isDraft: false,
})

function buildRepository(
  listAll: TimelineRepository["listAll"],
): TimelineRepository {
  return {
    listAll,
    findById: vi.fn(),
    listGameOptions: vi.fn(),
    listPlayerOptions: vi.fn(),
    listContributorOptions: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
  }
}

describe("ListTimelineChunk", () => {
  const events = Array.from(
    { length: TIMELINE_CHUNK_SIZE + 2 },
    (_, index) => eventIn(1000 + index * 20),
  )

  function read(
    order: "oldest" | "newest",
    offset: number,
  ) {
    return new ListTimelineChunk(
      buildRepository(vi.fn(async () => succeed(events))),
    ).call({ order, offset })
  }

  it("returns the first chunk with a cursor to the next", async () => {
    const result = await read("oldest", 0)

    expect(result.status).toBe("success")
    if (result.status !== "success") return
    expect(result.data.items).toHaveLength(
      TIMELINE_CHUNK_SIZE,
    )
    expect(result.data.nextOffset).toBe(TIMELINE_CHUNK_SIZE)
    expect(result.data.total).toBe(events.length)
  })

  it("keeps sides and indexes consistent across the chunk boundary", async () => {
    const first = await read("oldest", 0)
    const second = await read("oldest", TIMELINE_CHUNK_SIZE)

    if (
      first.status !== "success" ||
      second.status !== "success"
    ) {
      throw new Error("expected success")
    }
    expect(second.data.nextOffset).toBeNull()
    const joined = [
      ...first.data.items,
      ...second.data.items,
    ]
    expect(joined.map((p) => p.index)).toEqual(
      events.map((_, index) => index),
    )
    expect(joined.map((p) => p.side)).toEqual(
      events.map((_, index) =>
        index % 2 === 0 ? "left" : "right",
      ),
    )
  })

  it("starts from the newest event for newest", async () => {
    const result = await read("newest", 0)

    if (result.status !== "success") {
      throw new Error("expected success")
    }
    expect(result.data.items[0].event.year).toBe(
      events[events.length - 1].year,
    )
    expect(result.data.items[0].side).toBe("left")
  })

  it("propagates a repository failure", async () => {
    const failure = fail(new Error("db down"))

    expect(
      await new ListTimelineChunk(
        buildRepository(vi.fn(async () => failure)),
      ).call({ order: "oldest", offset: 0 }),
    ).toBe(failure)
  })
})
