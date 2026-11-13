import { describe, expect, it, vi } from "vitest"

vi.mock("next/server", () => ({
  connection: vi.fn(async () => undefined),
}))

import { fail, succeed } from "@/core/data-state"

import { createTimelineLoaders } from "./timeline-loaders"

const slice = { items: [], total: 0, nextOffset: null }

function buildLoaders(
  call: ReturnType<typeof vi.fn> = vi.fn(async () =>
    succeed(slice),
  ),
) {
  return {
    loaders: createTimelineLoaders({
      listTimelineChunk: { call },
    }),
    call,
  }
}

describe("loadTimelinePage", () => {
  it("reads the first chunk in the requested order", async () => {
    const { loaders, call } = buildLoaders()

    expect(
      await loaders.loadTimelinePage({ sort: "newest" }),
    ).toEqual({ order: "newest", first: slice })
    expect(call).toHaveBeenCalledWith({
      order: "newest",
      offset: 0,
    })
  })

  it("falls back to oldest for an unknown or repeated order", async () => {
    const { loaders } = buildLoaders()

    expect(
      (await loaders.loadTimelinePage({ sort: "sideways" }))
        .order,
    ).toBe("oldest")
    expect((await loaders.loadTimelinePage({})).order).toBe(
      "oldest",
    )
    expect(
      (
        await loaders.loadTimelinePage({
          sort: ["newest", "oldest"],
        })
      ).order,
    ).toBe("newest")
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { loaders } = buildLoaders(
      vi.fn(async () => fail(cause)),
    )

    await expect(loaders.loadTimelinePage({})).rejects.toBe(
      cause,
    )
  })
})

describe("loadTimelineChunk", () => {
  it("passes a valid order and offset through", async () => {
    const { loaders, call } = buildLoaders()

    await loaders.loadTimelineChunk("newest", 12)

    expect(call).toHaveBeenCalledWith({
      order: "newest",
      offset: 12,
    })
  })

  it.each([
    [-5, 0],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
    [1.5, 0],
  ])(
    "sanitises the offset %s to %s",
    async (offset, safe) => {
      const { loaders, call } = buildLoaders()

      await loaders.loadTimelineChunk("oldest", offset)

      expect(call).toHaveBeenCalledWith({
        order: "oldest",
        offset: safe,
      })
    },
  )

  it("falls back to oldest for an unknown order", async () => {
    const { loaders, call } = buildLoaders()

    await loaders.loadTimelineChunk("drop table", 0)

    expect(call).toHaveBeenCalledWith({
      order: "oldest",
      offset: 0,
    })
  })
})
