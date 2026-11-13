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

import type {
  Player,
  PlayerDetail,
} from "../../domain/entities/player"
import type { PlayerErrors } from "../../domain/entities/player-draft"
import {
  createPlayersAdminState,
  type PlayersAdminDependencies,
} from "./players-admin-state"

const player: Player = {
  slug: "shusaku",
  inductionNumber: 1,
  name: "Shusaku",
  nativeName: "秀策",
  country: "Japan",
  years: "1829-1862",
  distinction: "Invincible",
  bio: "Bio",
  photoUrl: null,
  photoPosition: "50% 50%",
  featured: false,
}
const detail: PlayerDetail = { ...player, games: [] }

const fields = {
  slug: "shusaku",
  name: "Shusaku",
  nativeName: "秀策",
  country: "Japan",
  years: "1829-1862",
  distinction: "Invincible",
  bio: "Bio",
  photoUrl: "",
  photoPosition: "50% 50%",
  inductionNumber: "1",
}

function buildFormData(
  values: Record<string, string>,
): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value)
  }
  return formData
}

function buildState({
  requireAdmin = vi.fn(async () => undefined),
  saveResult = { status: "saved" },
  getResult = succeed<PlayerDetail | null>(detail),
  listResult = succeed<readonly Player[]>([player]),
  deleteResult = succeed(undefined),
}: {
  requireAdmin?: ReturnType<typeof vi.fn>
  saveResult?: SaveResult<PlayerErrors>
  getResult?:
    | ReturnType<typeof succeed<PlayerDetail | null>>
    | ReturnType<typeof fail>
  listResult?:
    | ReturnType<typeof succeed<readonly Player[]>>
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
  const dependencies: PlayersAdminDependencies = {
    requireAdmin,
    listPlayers: { call: useCases.list },
    getPlayerDetail: { call: useCases.get },
    savePlayer: { call: useCases.save },
    deletePlayer: { call: useCases.remove },
  }
  return {
    state: createPlayersAdminState(dependencies),
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

describe("loadAdminPlayers", () => {
  it("lists every country after checking the admin", async () => {
    const { state, requireAdmin, list } = buildState()

    expect(await state.loadAdminPlayers()).toEqual([player])
    expect(list).toHaveBeenCalledWith({ country: null })
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(list.mock.invocationCallOrder[0])
  })

  it("does not list anything when the admin check rejects", async () => {
    const { state, list } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.loadAdminPlayers()).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(list).not.toHaveBeenCalled()
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { state } = buildState({
      listResult: fail(cause),
    })

    await expect(state.loadAdminPlayers()).rejects.toBe(
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

  it("returns the player of a slug", async () => {
    const { state, get, requireAdmin } = buildState()

    expect(await state.loadEditor("shusaku")).toEqual(
      detail,
    )
    expect(get).toHaveBeenCalledWith({ slug: "shusaku" })
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(get.mock.invocationCallOrder[0])
  })

  it("is a 404 for an unknown slug", async () => {
    const { state } = buildState({
      getResult: succeed(null),
    })

    await expect(
      state.loadEditor("nobody"),
    ).rejects.toThrow("NEXT_NOT_FOUND")
  })

  it.each(["new", "shusaku"])(
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

    await expect(state.loadEditor("shusaku")).rejects.toBe(
      cause,
    )
  })
})

describe("saveFromForm", () => {
  it("passes a null original slug and the form values when creating", async () => {
    const { state, save } = buildState()

    await expect(
      state.saveFromForm("new", buildFormData(fields)),
    ).rejects.toThrow()

    expect(save).toHaveBeenCalledWith({
      originalSlug: null,
      form: { ...fields, featured: false },
    })
  })

  it("passes the slug of the URL as the original slug when editing", async () => {
    const { state, save } = buildState()

    await expect(
      state.saveFromForm(
        "old-slug",
        buildFormData({ ...fields, featured: "on" }),
      ),
    ).rejects.toThrow()

    expect(save).toHaveBeenCalledWith({
      originalSlug: "old-slug",
      form: { ...fields, featured: true },
    })
  })

  it("turns missing fields into empty strings and the missing flag into false", async () => {
    const { state, save } = buildState({
      saveResult: { status: "invalid", errors: {} },
    })

    await state.saveFromForm("new", new FormData())

    expect(save).toHaveBeenCalledWith({
      originalSlug: null,
      form: {
        slug: "",
        name: "",
        nativeName: "",
        country: "",
        years: "",
        distinction: "",
        bio: "",
        photoUrl: "",
        photoPosition: "",
        inductionNumber: "",
        featured: false,
      },
    })
  })

  it("revalidates the site and redirects to the list when saved", async () => {
    const { state } = buildState()

    await expect(
      state.saveFromForm("new", buildFormData(fields)),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/players")

    expect(revalidatePath).toHaveBeenCalledWith(
      "/",
      "layout",
    )
  })

  it("maps an invalid result to the invalid state with the entered values", async () => {
    const errors = { name: "Enter a name." }
    const { state } = buildState({
      saveResult: { status: "invalid", errors },
    })

    expect(
      await state.saveFromForm(
        "new",
        buildFormData({ ...fields, name: "" }),
      ),
    ).toEqual({
      status: "invalid",
      errors,
      values: { ...fields, name: "", featured: false },
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
        "The player could not be saved. Try again in a moment.",
      values: { ...fields, featured: false },
    })
    expect(logged).toHaveBeenCalledWith(
      "Could not save the player:",
      "TypeError",
    )
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

describe("deleteBySlug", () => {
  it("deletes, revalidates and redirects to the list", async () => {
    const { state, remove } = buildState()

    await expect(
      state.deleteBySlug("shusaku"),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/players")

    expect(remove).toHaveBeenCalledWith({ slug: "shusaku" })
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

    await expect(
      state.deleteBySlug("shusaku"),
    ).rejects.toBe(cause)
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it("does not delete when the admin check rejects", async () => {
    const { state, remove } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(
      state.deleteBySlug("shusaku"),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/sign-in")
    expect(remove).not.toHaveBeenCalled()
  })
})
