import { describe, expect, it, vi } from "vitest"

import type { SiteResourcesDataSource } from "../data-sources/site-resources-data-source"
import { ResourceLinkModel } from "../models/resource-link-model"
import { SiteResourcesRepositoryImpl } from "./site-resources-repository-impl"

function build(
  dataSource: Partial<
    Record<
      keyof SiteResourcesDataSource,
      ReturnType<typeof vi.fn>
    >
  >,
) {
  return new SiteResourcesRepositoryImpl(
    dataSource as unknown as SiteResourcesDataSource,
  )
}

describe("SiteResourcesRepositoryImpl", () => {
  it("lists plain entities", async () => {
    const link = { url: "/a", description: null }
    const state = await build({
      fetchAll: vi.fn(async () => [
        ResourceLinkModel.fromRawData(link),
      ]),
    }).listAll()

    expect(state).toEqual({
      status: "success",
      data: [link],
    })
    if (state.status === "success") {
      expect(Object.getPrototypeOf(state.data[0])).toBe(
        Object.prototype,
      )
    }
  })

  it("replaces all links through the data source", async () => {
    const replaceAll = vi.fn(async () => undefined)
    const links = [{ url: "/a", description: "A" }]

    expect(
      await build({ replaceAll }).replaceAll(links),
    ).toEqual({
      status: "success",
      data: undefined,
    })
    expect(replaceAll).toHaveBeenCalledWith(links)
  })

  it("turns data source errors into failures", async () => {
    const cause = new Error("db down")
    const boom = vi.fn(async () => {
      throw cause
    })
    const repository = build({
      fetchAll: boom,
      replaceAll: boom,
    })

    expect(await repository.listAll()).toEqual({
      status: "failure",
      error: cause,
    })
    expect(await repository.replaceAll([])).toEqual({
      status: "failure",
      error: cause,
    })
  })
})
