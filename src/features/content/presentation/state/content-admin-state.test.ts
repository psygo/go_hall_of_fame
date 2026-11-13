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
import type {
  FieldErrors,
  SaveResult,
} from "@/core/validation"

import {
  PAGE_TEXT_DEFINITIONS,
  toEditableTexts,
  type EditableText,
} from "../../domain/entities/page-text"
import {
  createContentAdminState,
  type ContentAdminDependencies,
} from "./content-admin-state"

const texts: readonly EditableText[] = toEditableTexts({})

const emptyForm = Object.fromEntries(
  PAGE_TEXT_DEFINITIONS.map(({ key }) => [key, ""]),
)

function buildState({
  requireAdmin = vi.fn(async () => undefined),
  saveResult = { status: "saved" },
  listResult = succeed(texts),
}: {
  requireAdmin?: ReturnType<typeof vi.fn>
  saveResult?: SaveResult<FieldErrors>
  listResult?:
    | ReturnType<typeof succeed<readonly EditableText[]>>
    | ReturnType<typeof fail>
} = {}) {
  const list = vi.fn(async () => listResult)
  const save = vi.fn(async () => saveResult)
  const dependencies: ContentAdminDependencies = {
    requireAdmin,
    listEditableTexts: { call: list },
    saveSiteTexts: { call: save },
  }
  return {
    state: createContentAdminState(dependencies),
    requireAdmin,
    list,
    save,
  }
}

const rejectingAdmin = () =>
  vi.fn(async () => {
    throw new Error("NEXT_REDIRECT:/admin/sign-in")
  })

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
  vi.mocked(revalidatePath).mockClear()
  vi.mocked(redirect).mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("loadEditableTexts", () => {
  it("returns the texts after checking the admin", async () => {
    const { state, requireAdmin, list } = buildState()

    expect(await state.loadEditableTexts()).toEqual(texts)
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(list.mock.invocationCallOrder[0])
  })

  it("does not list anything when the admin check rejects", async () => {
    const { state, list } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.loadEditableTexts()).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(list).not.toHaveBeenCalled()
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { state } = buildState({
      listResult: fail(cause),
    })

    await expect(state.loadEditableTexts()).rejects.toBe(
      cause,
    )
  })
})

describe("saveFromForm", () => {
  it("passes one entry per known text key, empty for missing fields", async () => {
    const { state, save } = buildState()
    const formData = new FormData()
    formData.set("home.title", "A new heading")

    await expect(
      state.saveFromForm(formData),
    ).rejects.toThrow()

    expect(save).toHaveBeenCalledWith({
      form: { ...emptyForm, "home.title": "A new heading" },
    })
  })

  it("ignores fields that are not text keys", async () => {
    const { state, save } = buildState()
    const formData = new FormData()
    formData.set("evil.key", "x")

    await expect(
      state.saveFromForm(formData),
    ).rejects.toThrow()

    expect(save).toHaveBeenCalledWith({ form: emptyForm })
  })

  it("revalidates the site and redirects with the saved flag", async () => {
    const { state } = buildState()

    await expect(
      state.saveFromForm(new FormData()),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/pages?saved=1")

    expect(revalidatePath).toHaveBeenCalledWith(
      "/",
      "layout",
    )
  })

  it("maps an invalid result to the invalid state with the entered values", async () => {
    const errors = {
      "home.title": "Use at most 120 characters.",
    }
    const { state } = buildState({
      saveResult: { status: "invalid", errors },
    })
    const formData = new FormData()
    formData.set("home.title", "x")

    expect(await state.saveFromForm(formData)).toEqual({
      status: "invalid",
      errors,
      values: { ...emptyForm, "home.title": "x" },
    })
    expect(redirect).not.toHaveBeenCalled()
  })

  it("maps a failed result to the failed state, logging only the error name", async () => {
    const logged = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})
    const { state } = buildState({
      saveResult: {
        status: "failed",
        error: new TypeError("secret"),
      },
    })

    expect(
      await state.saveFromForm(new FormData()),
    ).toEqual({
      status: "failed",
      message:
        "The texts could not be saved. Try again in a moment.",
      values: emptyForm,
    })
    expect(logged).toHaveBeenCalledWith(
      "Could not save the page texts:",
      "TypeError",
    )
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it("does not save when the admin check rejects", async () => {
    const { state, save } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(
      state.saveFromForm(new FormData()),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/sign-in")
    expect(save).not.toHaveBeenCalled()
  })
})
