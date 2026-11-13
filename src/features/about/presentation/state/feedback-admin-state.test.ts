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
import { ADMIN_PAGE_SIZE } from "@/core/list-query"
import { ADMIN_PATHS } from "@/shared/ui/presentation/admin-paths"

import type { FeedbackRecord } from "../../domain/entities/feedback-record"
import { createFeedbackAdminState } from "./feedback-admin-state"

const record = (id: number): FeedbackRecord => ({
  id,
  email: "a@b.example",
  description: "Hi",
  isRead: false,
  createdAt: new Date(0),
})

function buildState({
  requireAdmin = vi.fn(async () => undefined),
  listResult = succeed<readonly FeedbackRecord[]>([
    record(1),
  ]),
  readResult = succeed(undefined),
  deleteResult = succeed(undefined),
}: {
  requireAdmin?: ReturnType<typeof vi.fn>
  listResult?:
    | ReturnType<typeof succeed<readonly FeedbackRecord[]>>
    | ReturnType<typeof fail>
  readResult?:
    | ReturnType<typeof succeed<void>>
    | ReturnType<typeof fail>
  deleteResult?:
    | ReturnType<typeof succeed<void>>
    | ReturnType<typeof fail>
} = {}) {
  const list = vi.fn(async () => listResult)
  const setRead = vi.fn(async () => readResult)
  const remove = vi.fn(async () => deleteResult)
  return {
    state: createFeedbackAdminState({
      requireAdmin,
      listFeedback: { call: list },
      setFeedbackRead: { call: setRead },
      deleteFeedback: { call: remove },
    }),
    requireAdmin,
    list,
    setRead,
    remove,
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

describe("loadFeedback", () => {
  it("checks the admin before listing and returns the first page", async () => {
    const { state, requireAdmin, list } = buildState()

    expect(await state.loadFeedback()).toEqual({
      items: [record(1)],
      page: 1,
      pageCount: 1,
      total: 1,
    })
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(list.mock.invocationCallOrder[0])
  })

  it("paginates, clamping and tolerating bad pages", async () => {
    const many = Array.from(
      { length: ADMIN_PAGE_SIZE + 1 },
      (_, i) => record(i + 1),
    )
    const { state } = buildState({
      listResult: succeed(many),
    })

    expect(
      (await state.loadFeedback("2")).items,
    ).toHaveLength(1)
    expect((await state.loadFeedback("99")).page).toBe(2)
    expect((await state.loadFeedback("x")).page).toBe(1)
  })

  it("lists nothing when the guard rejects", async () => {
    const { state, list } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.loadFeedback()).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(list).not.toHaveBeenCalled()
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { state } = buildState({
      listResult: fail(cause),
    })

    await expect(state.loadFeedback()).rejects.toBe(cause)
  })
})

describe("non-integer ids", () => {
  it.each([1.5, Number.NaN])(
    "throws for %s after the guard, without touching the data",
    async (id) => {
      const { state, requireAdmin, setRead, remove } =
        buildState()

      await expect(state.setRead(id, true)).rejects.toThrow(
        "Unknown feedback",
      )
      await expect(state.deleteById(id)).rejects.toThrow(
        "Unknown feedback",
      )

      expect(requireAdmin).toHaveBeenCalledTimes(2)
      expect(setRead).not.toHaveBeenCalled()
      expect(remove).not.toHaveBeenCalled()
      expect(revalidatePath).not.toHaveBeenCalled()
    },
  )

  it("checks the admin before rejecting the id", async () => {
    const { state } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.deleteById(1.5)).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
  })
})

describe("setRead", () => {
  it("checks the admin first, updates, revalidates and redirects", async () => {
    const { state, requireAdmin, setRead } = buildState()

    await expect(state.setRead(3, true)).rejects.toThrow(
      `NEXT_REDIRECT:${ADMIN_PATHS.feedback}`,
    )

    expect(setRead).toHaveBeenCalledWith({
      id: 3,
      isRead: true,
    })
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(setRead.mock.invocationCallOrder[0])
    expect(revalidatePath).toHaveBeenCalledWith(
      ADMIN_PATHS.feedback,
    )
  })

  it("logs only the error name and throws on failure", async () => {
    const { state } = buildState({
      readResult: fail(new TypeError("secret a@b.example")),
    })

    await expect(state.setRead(3, true)).rejects.toThrow(
      "The change could not be saved.",
    )
    expect(console.error).toHaveBeenCalledWith(
      "Could not update the feedback:",
      "TypeError",
    )
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it("does nothing when the guard rejects", async () => {
    const { state, setRead } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.setRead(3, true)).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(setRead).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe("deleteById", () => {
  it("checks the admin first, deletes, revalidates and redirects", async () => {
    const { state, requireAdmin, remove } = buildState()

    await expect(state.deleteById(3)).rejects.toThrow(
      `NEXT_REDIRECT:${ADMIN_PATHS.feedback}`,
    )

    expect(remove).toHaveBeenCalledWith({ id: 3 })
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(remove.mock.invocationCallOrder[0])
    expect(revalidatePath).toHaveBeenCalledWith(
      ADMIN_PATHS.feedback,
    )
  })

  it("logs only the error name and throws on failure", async () => {
    const { state } = buildState({
      deleteResult: fail(new RangeError("secret")),
    })

    await expect(state.deleteById(3)).rejects.toThrow(
      "The change could not be saved.",
    )
    expect(console.error).toHaveBeenCalledWith(
      "Could not delete the feedback:",
      "RangeError",
    )
    expect(redirect).not.toHaveBeenCalled()
  })

  it("does nothing when the guard rejects", async () => {
    const { state, remove } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.deleteById(3)).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(remove).not.toHaveBeenCalled()
  })
})
