import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
  }),
}))
vi.mock("next/server", () => ({
  connection: vi.fn(async () => undefined),
}))

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { fail, succeed } from "@/core/data-state"
import type { ResourceLink } from "@/core/resources"
import type { SaveResult } from "@/core/validation"

import type { SiteResourcesErrors } from "../../domain/entities/site-resources"
import { createResourcesAdminState } from "./resources-admin-state"

const link: ResourceLink = { url: "/a", description: "A" }

function buildState({
  requireAdmin = vi.fn(async () => undefined),
  saveResult = { status: "saved" },
  listResult = succeed<readonly ResourceLink[]>([link]),
}: {
  requireAdmin?: ReturnType<typeof vi.fn>
  saveResult?: SaveResult<SiteResourcesErrors>
  listResult?:
    | ReturnType<typeof succeed<readonly ResourceLink[]>>
    | ReturnType<typeof fail>
} = {}) {
  const list = vi.fn(async () => listResult)
  const save = vi.fn(async () => saveResult)
  return {
    state: createResourcesAdminState({
      requireAdmin,
      listSiteResources: { call: list },
      saveSiteResources: { call: save },
    }),
    requireAdmin,
    list,
    save,
  }
}

const rejectingAdmin = () =>
  vi.fn(async () => {
    throw new Error("NEXT_REDIRECT:/admin/sign-in")
  })

function formWith(
  rows: readonly [string, string][],
): FormData {
  const formData = new FormData()
  for (const [url, description] of rows) {
    formData.append("resourceUrl", url)
    formData.append("resourceDescription", description)
  }
  return formData
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
  vi.mocked(revalidatePath).mockClear()
  vi.mocked(redirect).mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("loadEditor", () => {
  it("returns the links after checking the admin", async () => {
    const { state, requireAdmin, list } = buildState()

    expect(await state.loadEditor()).toEqual([link])
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(list.mock.invocationCallOrder[0])
  })

  it("lists nothing when the admin check rejects", async () => {
    const { state, list } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.loadEditor()).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(list).not.toHaveBeenCalled()
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { state } = buildState({
      listResult: fail(cause),
    })

    await expect(state.loadEditor()).rejects.toBe(cause)
  })
})

describe("saveFromForm", () => {
  it("reads the resource rows and passes them to the use case", async () => {
    const { state, save } = buildState()

    await expect(
      state.saveFromForm(
        formWith([
          ["/a", "A"],
          ["/b", ""],
        ]),
      ),
    ).rejects.toThrow()

    expect(save).toHaveBeenCalledWith({
      form: {
        resources: [
          { url: "/a", description: "A" },
          { url: "/b", description: "" },
        ],
      },
    })
  })

  it("revalidates the site and redirects to the editor when saved", async () => {
    const { state } = buildState()

    await expect(
      state.saveFromForm(formWith([])),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/resources")
    expect(revalidatePath).toHaveBeenCalledWith(
      "/",
      "layout",
    )
  })

  it("returns the invalid state with the entered values", async () => {
    const errors = {
      resources: "Each resource needs a link.",
    }
    const { state } = buildState({
      saveResult: { status: "invalid", errors },
    })

    expect(
      await state.saveFromForm(formWith([["", "x"]])),
    ).toEqual({
      status: "invalid",
      errors,
      values: {
        resources: [{ url: "", description: "x" }],
      },
    })
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it("returns the failed state, logging only the error name", async () => {
    const { state } = buildState({
      saveResult: {
        status: "failed",
        error: new TypeError("secret"),
      },
    })

    expect(await state.saveFromForm(formWith([]))).toEqual({
      status: "failed",
      message:
        "The resources could not be saved. Try again in a moment.",
      values: { resources: [] },
    })
    expect(console.error).toHaveBeenCalledWith(
      "Could not save the resources:",
      "TypeError",
    )
  })

  it("does not save when the admin check rejects", async () => {
    const { state, save } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(
      state.saveFromForm(formWith([["/a", ""]])),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/sign-in")
    expect(save).not.toHaveBeenCalled()
  })
})
