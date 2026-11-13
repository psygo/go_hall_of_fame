import { describe, expect, it, vi } from "vitest"

vi.mock("next/server", () => ({
  connection: vi.fn(async () => undefined),
}))

import { fail, succeed } from "@/core/data-state"

import { createResourcesLoaders } from "./resources-loaders"

const page = { items: [], page: 1, pageCount: 1, total: 0 }

function build(
  call: ReturnType<typeof vi.fn> = vi.fn(async () =>
    succeed(page),
  ),
) {
  return {
    call,
    loaders: createResourcesLoaders({
      pageSiteResources: { call },
    }),
  }
}

describe("loadResourcesPage", () => {
  it("passes the parsed page and returns the page", async () => {
    const { loaders, call } = build()

    expect(
      await loaders.loadResourcesPage({ page: "3" }),
    ).toBe(page)
    expect(call).toHaveBeenCalledWith({ page: 3 })
  })

  it.each([undefined, "abc", "0", "-1"])(
    "falls back to page 1 for %j",
    async (value) => {
      const { loaders, call } = build()

      await loaders.loadResourcesPage({ page: value })

      expect(call).toHaveBeenCalledWith({ page: 1 })
    },
  )

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { loaders } = build(
      vi.fn(async () => fail(cause)),
    )

    await expect(
      loaders.loadResourcesPage({}),
    ).rejects.toBe(cause)
  })
})
