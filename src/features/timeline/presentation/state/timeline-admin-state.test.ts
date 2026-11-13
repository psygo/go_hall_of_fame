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
import { notFound, redirect } from "next/navigation"

import { fail, succeed } from "@/core/data-state"
import type { SaveResult } from "@/core/validation"

import type { TimelineEvent } from "../../domain/entities/timeline-event"
import type { TimelineEventErrors } from "../../domain/entities/timeline-event-draft"
import {
  createTimelineAdminState,
  type TimelineAdminDependencies,
} from "./timeline-admin-state"

const event: TimelineEvent = {
  id: 3,
  year: 1612,
  title: "Founded",
  text: "Text",
}

function buildFormData(
  fields: Record<string, string>,
): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value)
  }
  return formData
}

const fields = {
  year: "1612",
  title: "Founded",
  text: "Text",
}

function buildState({
  requireAdmin = vi.fn(async () => undefined),
  saveResult = { status: "saved" },
  getResult = succeed<TimelineEvent | null>(event),
  listResult = succeed<readonly TimelineEvent[]>([event]),
  deleteResult = succeed(undefined),
}: {
  requireAdmin?: ReturnType<typeof vi.fn>
  saveResult?: SaveResult<TimelineEventErrors>
  getResult?:
    | ReturnType<typeof succeed<TimelineEvent | null>>
    | ReturnType<typeof fail>
  listResult?:
    | ReturnType<typeof succeed<readonly TimelineEvent[]>>
    | ReturnType<typeof fail>
  deleteResult?:
    | ReturnType<typeof succeed<void>>
    | ReturnType<typeof fail>
} = {}) {
  const useCases = {
    list: vi.fn(async () => listResult),
    get: vi.fn(async () => getResult),
    save: vi.fn(async () => saveResult),
    remove: vi.fn(async () => deleteResult),
  }
  const dependencies: TimelineAdminDependencies = {
    requireAdmin,
    listTimelineEvents: { call: useCases.list },
    getTimelineEvent: { call: useCases.get },
    saveTimelineEvent: { call: useCases.save },
    deleteTimelineEvent: { call: useCases.remove },
  }
  return {
    state: createTimelineAdminState(dependencies),
    requireAdmin,
    ...useCases,
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
  vi.mocked(notFound).mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("loadAdminTimeline", () => {
  it("returns the events after checking the admin", async () => {
    const { state, requireAdmin, list } = buildState()

    expect(await state.loadAdminTimeline()).toEqual([event])
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(list.mock.invocationCallOrder[0])
  })

  it("does not list anything when the admin check rejects", async () => {
    const { state, list } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.loadAdminTimeline()).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(list).not.toHaveBeenCalled()
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { state } = buildState({
      listResult: fail(cause),
    })

    await expect(state.loadAdminTimeline()).rejects.toBe(
      cause,
    )
  })
})

describe("loadEditor", () => {
  it("returns null for new without a lookup", async () => {
    const { state, get } = buildState()

    expect(await state.loadEditor("new")).toBeNull()
    expect(get).not.toHaveBeenCalled()
  })

  it("returns the event of a numeric id", async () => {
    const { state, get, requireAdmin } = buildState()

    expect(await state.loadEditor("3")).toEqual(event)
    expect(get).toHaveBeenCalledWith({ id: 3 })
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(get.mock.invocationCallOrder[0])
  })

  it("is a 404 for an unknown id", async () => {
    const { state } = buildState({
      getResult: succeed(null),
    })

    await expect(state.loadEditor("99")).rejects.toThrow(
      "NEXT_NOT_FOUND",
    )
  })

  it("is a 404 for a non-numeric id, without a lookup", async () => {
    const { state, get } = buildState()

    await expect(state.loadEditor("abc")).rejects.toThrow(
      "NEXT_NOT_FOUND",
    )
    expect(get).not.toHaveBeenCalled()
  })

  it.each(["new", "3"])(
    "checks the admin first even for %s",
    async (param) => {
      const { state, get } = buildState({
        requireAdmin: rejectingAdmin(),
      })

      await expect(state.loadEditor(param)).rejects.toThrow(
        "NEXT_REDIRECT:/admin/sign-in",
      )
      expect(get).not.toHaveBeenCalled()
    },
  )

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { state } = buildState({ getResult: fail(cause) })

    await expect(state.loadEditor("3")).rejects.toBe(cause)
  })
})

describe("saveFromForm", () => {
  it("passes a null id and the form values when creating", async () => {
    const { state, save } = buildState()

    await expect(
      state.saveFromForm("new", buildFormData(fields)),
    ).rejects.toThrow()

    expect(save).toHaveBeenCalledWith({
      id: null,
      form: fields,
    })
  })

  it("passes the numeric id when editing", async () => {
    const { state, save } = buildState()

    await expect(
      state.saveFromForm("3", buildFormData(fields)),
    ).rejects.toThrow()

    expect(save).toHaveBeenCalledWith({
      id: 3,
      form: fields,
    })
  })

  it("turns missing fields into empty strings", async () => {
    const { state, save } = buildState({
      saveResult: { status: "invalid", errors: {} },
    })

    await state.saveFromForm("new", new FormData())

    expect(save).toHaveBeenCalledWith({
      id: null,
      form: { year: "", title: "", text: "" },
    })
  })

  it("revalidates the site and redirects to the list when saved", async () => {
    const { state } = buildState()

    await expect(
      state.saveFromForm("new", buildFormData(fields)),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/timeline")

    expect(revalidatePath).toHaveBeenCalledWith(
      "/",
      "layout",
    )
  })

  it("maps an invalid result to the invalid state with the entered values", async () => {
    const errors = {
      year: "Enter a year between 1 and 2999.",
    }
    const { state } = buildState({
      saveResult: { status: "invalid", errors },
    })

    expect(
      await state.saveFromForm(
        "new",
        buildFormData({ ...fields, year: "0" }),
      ),
    ).toEqual({
      status: "invalid",
      errors,
      values: { ...fields, year: "0" },
    })
    expect(revalidatePath).not.toHaveBeenCalled()
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
      await state.saveFromForm(
        "new",
        buildFormData(fields),
      ),
    ).toEqual({
      status: "failed",
      message:
        "The event could not be saved. Try again in a moment.",
      values: fields,
    })
    expect(logged).toHaveBeenCalledWith(
      "Could not save the timeline event:",
      "TypeError",
    )
    expect(redirect).not.toHaveBeenCalled()
  })

  it("does not save when the admin check rejects", async () => {
    const { state, save } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(
      state.saveFromForm("new", buildFormData(fields)),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/sign-in")
    expect(save).not.toHaveBeenCalled()
  })
})

describe("deleteById", () => {
  it("deletes, revalidates and redirects to the list", async () => {
    const { state, remove } = buildState()

    await expect(state.deleteById(3)).rejects.toThrow(
      "NEXT_REDIRECT:/admin/timeline",
    )

    expect(remove).toHaveBeenCalledWith({ id: 3 })
    expect(revalidatePath).toHaveBeenCalledWith(
      "/",
      "layout",
    )
  })

  it("throws the failure without revalidating or redirecting", async () => {
    const cause = new Error("db down")
    const { state } = buildState({
      deleteResult: fail(cause),
    })

    await expect(state.deleteById(3)).rejects.toThrow(
      "The change could not be saved.",
    )
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it("does not delete when the admin check rejects", async () => {
    const { state, remove } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.deleteById(3)).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(remove).not.toHaveBeenCalled()
  })
})
