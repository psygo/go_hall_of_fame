import { describe, expect, it, vi } from "vitest"

import { fail, succeed } from "@/core/data-state"

import type { SiteResourcesRepository } from "../repositories/site-resources-repository"
import { SaveSiteResources } from "./save-site-resources"

function build(
  replaceAll: SiteResourcesRepository["replaceAll"] = vi.fn(
    async () => succeed(undefined),
  ),
) {
  const repository: SiteResourcesRepository = {
    listAll: vi.fn(),
    replaceAll,
  }
  return {
    repository,
    useCase: new SaveSiteResources(repository),
  }
}

const valid = {
  resources: [
    { url: " https://a.example ", description: "" },
  ],
}

describe("SaveSiteResources", () => {
  it("saves the cleaned links", async () => {
    const { useCase, repository } = build()

    expect(await useCase.call({ form: valid })).toEqual({
      status: "saved",
    })
    expect(repository.replaceAll).toHaveBeenCalledWith([
      { url: "https://a.example", description: null },
    ])
  })

  it("returns the errors without saving when invalid", async () => {
    const { useCase, repository } = build()

    expect(
      await useCase.call({
        form: {
          resources: [{ url: "", description: "x" }],
        },
      }),
    ).toEqual({
      status: "invalid",
      errors: { resources: "Each resource needs a link." },
    })
    expect(repository.replaceAll).not.toHaveBeenCalled()
  })

  it("returns failed when saving fails", async () => {
    const error = new Error("db down")
    const { useCase } = build(
      vi.fn(async () => fail(error)),
    )

    expect(await useCase.call({ form: valid })).toEqual({
      status: "failed",
      error,
    })
  })
})
