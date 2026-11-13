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
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  }),
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
import type { SaveResult } from "@/core/validation"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"

import type { Contributor } from "../../domain/entities/contributor"
import type { ContributorErrors } from "../../domain/entities/contributor-draft"
import { createContributorsAdminState } from "./contributors-admin-state"

const contributor: Contributor = {
  slug: "kgs",
  name: "KGS",
  kind: "organization",
  role: "Server",
  period: "",
  bio: "Bio",
  photoUrl: null,
  photoPosition: "50% 50%",
  isDraft: false,
}

const fields = {
  slug: "kgs",
  name: "KGS",
  kind: "organization",
  role: "Server",
  period: "since 1999",
  bio: "Bio",
  photoUrl: "",
  photoPosition: "50% 50%",
}

function formDataOf(values: Record<string, string>) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value)
  }
  return formData
}

function buildState({
  requireAdmin = vi.fn(async () => undefined),
  saveResult = { status: "saved" },
  getResult = succeed<Contributor | null>(contributor),
  listResult = succeed<readonly Contributor[]>([
    contributor,
  ]),
  deleteResult = succeed(undefined),
}: {
  requireAdmin?: ReturnType<typeof vi.fn>
  saveResult?: SaveResult<ContributorErrors>
  getResult?:
    | ReturnType<typeof succeed<Contributor | null>>
    | ReturnType<typeof fail>
  listResult?:
    | ReturnType<typeof succeed<readonly Contributor[]>>
    | ReturnType<typeof fail>
  deleteResult?:
    | ReturnType<typeof succeed<void>>
    | ReturnType<typeof fail>
} = {}) {
  const list = vi.fn(async () => listResult)
  const get = vi.fn(async () => getResult)
  const save = vi.fn(async () => saveResult)
  const remove = vi.fn(async () => deleteResult)
  return {
    state: createContributorsAdminState({
      requireAdmin,
      listContributors: { call: list },
      getContributor: { call: get },
      saveContributor: { call: save },
      deleteContributor: { call: remove },
    }),
    requireAdmin,
    list,
    get,
    save,
    remove,
  }
}

const rejectingAdmin = () =>
  vi.fn(async () => {
    throw new Error("NEXT_REDIRECT:/admin/sign-in")
  })

const before = (
  first: ReturnType<typeof vi.fn>,
  second: ReturnType<typeof vi.fn>,
) =>
  expect(first.mock.invocationCallOrder[0]).toBeLessThan(
    second.mock.invocationCallOrder[0],
  )

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
  vi.mocked(revalidatePath).mockClear()
  vi.mocked(redirect).mockClear()
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe("loadAdminContributors", () => {
  it("returns the contributors after checking the admin", async () => {
    const { state, requireAdmin, list } = buildState()

    expect(await state.loadAdminContributors()).toEqual([
      contributor,
    ])
    before(requireAdmin, list)
  })

  it("lists nothing when the guard rejects", async () => {
    const { state, list } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(
      state.loadAdminContributors(),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/sign-in")
    expect(list).not.toHaveBeenCalled()
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { state } = buildState({
      listResult: fail(cause),
    })

    await expect(
      state.loadAdminContributors(),
    ).rejects.toBe(cause)
  })
})

describe("loadEditor", () => {
  it("gives null for new without reading, after the guard", async () => {
    const { state, requireAdmin, get } = buildState()

    expect(await state.loadEditor("new")).toBeNull()
    expect(requireAdmin).toHaveBeenCalled()
    expect(get).not.toHaveBeenCalled()
  })

  it("returns the contributor of the slug", async () => {
    const { state, requireAdmin, get } = buildState()

    expect(await state.loadEditor("kgs")).toEqual(
      contributor,
    )
    expect(get).toHaveBeenCalledWith({ slug: "kgs" })
    before(requireAdmin, get)
  })

  it("is a 404 for an unknown slug", async () => {
    const { state } = buildState({
      getResult: succeed(null),
    })

    await expect(state.loadEditor("ghost")).rejects.toThrow(
      "NEXT_NOT_FOUND",
    )
  })

  it("reads nothing when the guard rejects", async () => {
    const { state, get } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.loadEditor("kgs")).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(get).not.toHaveBeenCalled()
  })
})

describe("saveFromForm", () => {
  it("checks the admin first and passes a null original slug when creating", async () => {
    const { state, requireAdmin, save } = buildState()

    await expect(
      state.saveFromForm("new", formDataOf(fields)),
    ).rejects.toThrow(
      `NEXT_REDIRECT:${ADMIN_PATHS.contributors}`,
    )

    expect(save).toHaveBeenCalledWith({
      originalSlug: null,
      form: { ...fields, isDraft: false },
    })
    before(requireAdmin, save)
    expect(revalidatePath).toHaveBeenCalledWith(
      "/",
      "layout",
    )
  })

  it("passes the slug of the URL as the original slug and reads the draft flag", async () => {
    const { state, save } = buildState()

    await expect(
      state.saveFromForm(
        "old-slug",
        formDataOf({ ...fields, isDraft: "on" }),
      ),
    ).rejects.toThrow()

    expect(save).toHaveBeenCalledWith({
      originalSlug: "old-slug",
      form: { ...fields, isDraft: true },
    })
  })

  it("turns missing fields into empty strings", async () => {
    const { state, save } = buildState({
      saveResult: { status: "invalid", errors: {} },
    })

    await state.saveFromForm("new", new FormData())

    expect(save).toHaveBeenCalledWith({
      originalSlug: null,
      form: {
        slug: "",
        name: "",
        kind: "",
        role: "",
        period: "",
        bio: "",
        photoUrl: "",
        photoPosition: "",
        isDraft: false,
      },
    })
  })

  it("returns the invalid state with the entered values", async () => {
    const errors = { name: "Enter a name." }
    const { state } = buildState({
      saveResult: { status: "invalid", errors },
    })

    expect(
      await state.saveFromForm("new", formDataOf(fields)),
    ).toEqual({
      status: "invalid",
      errors,
      values: { ...fields, isDraft: false },
    })
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it("returns the failed state, logging only the error name", async () => {
    const { state } = buildState({
      saveResult: {
        status: "failed",
        error: new TypeError("secret detail"),
      },
    })

    expect(
      await state.saveFromForm("new", formDataOf(fields)),
    ).toEqual({
      status: "failed",
      message:
        "The contributor could not be saved. Try again in a moment.",
      values: { ...fields, isDraft: false },
    })
    expect(console.error).toHaveBeenCalledWith(
      "Could not save the contributor:",
      "TypeError",
    )
  })

  it("saves nothing when the guard rejects", async () => {
    const { state, save } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(
      state.saveFromForm("new", formDataOf(fields)),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/sign-in")
    expect(save).not.toHaveBeenCalled()
  })
})

describe("deleteBySlug", () => {
  it("checks the admin first, deletes, revalidates and redirects", async () => {
    const { state, requireAdmin, remove } = buildState()

    await expect(state.deleteBySlug("kgs")).rejects.toThrow(
      `NEXT_REDIRECT:${ADMIN_PATHS.contributors}`,
    )

    expect(remove).toHaveBeenCalledWith({ slug: "kgs" })
    before(requireAdmin, remove)
    expect(revalidatePath).toHaveBeenCalledWith(
      "/",
      "layout",
    )
  })

  it("logs only the error name and throws on failure", async () => {
    const { state } = buildState({
      deleteResult: fail(new RangeError("secret")),
    })

    await expect(state.deleteBySlug("kgs")).rejects.toThrow(
      "The change could not be saved.",
    )
    expect(console.error).toHaveBeenCalledWith(
      "Could not delete the contributor:",
      "RangeError",
    )
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it("deletes nothing when the guard rejects", async () => {
    const { state, remove } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.deleteBySlug("kgs")).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(remove).not.toHaveBeenCalled()
  })
})
