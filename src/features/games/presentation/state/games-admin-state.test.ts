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
  Game,
  GameDetail,
  GamePlayerReference,
} from "../../domain/entities/game"
import type { GameErrors } from "../../domain/entities/game-draft"
import {
  createGamesAdminState,
  type GamesAdminDependencies,
} from "./games-admin-state"

const game: Game = {
  slug: "ear-reddening",
  year: 1846,
  name: "Ear-Reddening",
  black: "B",
  white: "W",
  result: "B+2",
  setting: "S",
  hook: "H",
  moment: "M",
  legacy: "L",
  sgfUrl: null,
  featured: false,
  sequence: 0,
}
const detail: GameDetail = { ...game, players: [] }
const options: readonly GamePlayerReference[] = [
  { slug: "shusaku", name: "Shusaku" },
]

const fields = {
  slug: "ear-reddening",
  year: "1846",
  name: "Ear-Reddening",
  black: "B",
  white: "W",
  result: "B+2",
  setting: "S",
  hook: "H",
  moment: "M",
  legacy: "L",
  sgfUrl: "",
  sequence: "0",
}

function buildFormData(
  values: Record<string, string>,
  playerSlugs: readonly string[] = [],
): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value)
  }
  for (const slug of playerSlugs) {
    formData.append("playerSlugs", slug)
  }
  return formData
}

function buildState({
  requireAdmin = vi.fn(async () => undefined),
  saveResult = { status: "saved" },
  getResult = succeed<GameDetail | null>(detail),
  listResult = succeed<readonly Game[]>([game]),
  optionsResult = succeed(options),
  deleteResult = succeed(undefined),
}: {
  requireAdmin?: ReturnType<typeof vi.fn>
  saveResult?: SaveResult<GameErrors>
  getResult?:
    | ReturnType<typeof succeed<GameDetail | null>>
    | ReturnType<typeof fail>
  listResult?:
    | ReturnType<typeof succeed<readonly Game[]>>
    | ReturnType<typeof fail>
  optionsResult?:
    | ReturnType<
        typeof succeed<readonly GamePlayerReference[]>
      >
    | ReturnType<typeof fail>
  deleteResult?:
    | ReturnType<typeof succeed<void>>
    | ReturnType<typeof fail>
} = {}) {
  const useCases = {
    list: vi.fn(async () => listResult),
    get: vi.fn(async () => getResult),
    options: vi.fn(async () => optionsResult),
    save: vi.fn(async () => saveResult),
    remove: vi.fn(async () => deleteResult),
  }
  const dependencies: GamesAdminDependencies = {
    requireAdmin,
    listGames: { call: useCases.list },
    getGameDetail: { call: useCases.get },
    listGamePlayerOptions: { call: useCases.options },
    saveGame: { call: useCases.save },
    deleteGame: { call: useCases.remove },
  }
  return {
    state: createGamesAdminState(dependencies),
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

describe("loadAdminGames", () => {
  it("returns the games after checking the admin", async () => {
    const { state, requireAdmin, list } = buildState()

    expect(await state.loadAdminGames()).toEqual([game])
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(list.mock.invocationCallOrder[0])
  })

  it("does not list anything when the admin check rejects", async () => {
    const { state, list } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.loadAdminGames()).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(list).not.toHaveBeenCalled()
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { state } = buildState({
      listResult: fail(cause),
    })

    await expect(state.loadAdminGames()).rejects.toBe(cause)
  })
})

describe("loadEditor", () => {
  it("returns a blank editor with the player options for new", async () => {
    const { state, get } = buildState()

    expect(await state.loadEditor("new")).toEqual({
      game: null,
      playerOptions: options,
    })
    expect(get).not.toHaveBeenCalled()
  })

  it("returns the game and the player options of a slug", async () => {
    const {
      state,
      get,
      requireAdmin,
      options: listOptions,
    } = buildState()

    expect(await state.loadEditor("ear-reddening")).toEqual(
      {
        game: detail,
        playerOptions: options,
      },
    )
    expect(get).toHaveBeenCalledWith({
      slug: "ear-reddening",
    })
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(listOptions.mock.invocationCallOrder[0])
  })

  it("is a 404 for an unknown slug", async () => {
    const { state } = buildState({
      getResult: succeed(null),
    })

    await expect(state.loadEditor("nope")).rejects.toThrow(
      "NEXT_NOT_FOUND",
    )
  })

  it.each(["new", "ear-reddening"])(
    "checks the admin first even for %s",
    async (param) => {
      const {
        state,
        get,
        options: listOptions,
      } = buildState({
        requireAdmin: rejectingAdmin(),
      })

      await expect(state.loadEditor(param)).rejects.toThrow(
        "NEXT_REDIRECT:/admin/sign-in",
      )
      expect(get).not.toHaveBeenCalled()
      expect(listOptions).not.toHaveBeenCalled()
    },
  )

  it("throws the original error when the options cannot be listed", async () => {
    const cause = new Error("db down")
    const { state } = buildState({
      optionsResult: fail(cause),
    })

    await expect(state.loadEditor("new")).rejects.toBe(
      cause,
    )
  })

  it("throws the original error when the game cannot be read", async () => {
    const cause = new Error("db down")
    const { state } = buildState({ getResult: fail(cause) })

    await expect(
      state.loadEditor("ear-reddening"),
    ).rejects.toBe(cause)
  })
})

describe("saveFromForm", () => {
  it("passes a null original slug, the fields and the chosen players when creating", async () => {
    const { state, save } = buildState()

    await expect(
      state.saveFromForm(
        "new",
        buildFormData(fields, ["shusaku", "lee-sedol"]),
      ),
    ).rejects.toThrow()

    expect(save).toHaveBeenCalledWith({
      originalSlug: null,
      form: {
        ...fields,
        featured: false,
        playerSlugs: ["shusaku", "lee-sedol"],
      },
    })
  })

  it("passes the slug of the URL as the original slug and reads the featured flag", async () => {
    const { state, save } = buildState()

    await expect(
      state.saveFromForm(
        "old-slug",
        buildFormData({ ...fields, featured: "on" }),
      ),
    ).rejects.toThrow()

    expect(save).toHaveBeenCalledWith({
      originalSlug: "old-slug",
      form: { ...fields, featured: true, playerSlugs: [] },
    })
  })

  it("turns missing fields into empty strings", async () => {
    const { state, save } = buildState({
      saveResult: { status: "invalid", errors: {} },
    })

    await state.saveFromForm("new", new FormData())

    expect(save).toHaveBeenCalledWith({
      originalSlug: null,
      form: expect.objectContaining({
        slug: "",
        year: "",
        sequence: "",
        featured: false,
        playerSlugs: [],
      }),
    })
  })

  it("revalidates the site and redirects to the list when saved", async () => {
    const { state } = buildState()

    await expect(
      state.saveFromForm("new", buildFormData(fields)),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/games")

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
        buildFormData({ ...fields, name: "" }, ["shusaku"]),
      ),
    ).toEqual({
      status: "invalid",
      errors,
      values: {
        ...fields,
        name: "",
        featured: false,
        playerSlugs: ["shusaku"],
      },
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
        "The game could not be saved. Try again in a moment.",
      values: {
        ...fields,
        featured: false,
        playerSlugs: [],
      },
    })
    expect(logged).toHaveBeenCalledWith(
      "Could not save the game:",
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
      state.deleteBySlug("ear-reddening"),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/games")

    expect(remove).toHaveBeenCalledWith({
      slug: "ear-reddening",
    })
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

    await expect(state.deleteBySlug("x")).rejects.toBe(
      cause,
    )
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it("does not delete when the admin check rejects", async () => {
    const { state, remove } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.deleteBySlug("x")).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(remove).not.toHaveBeenCalled()
  })
})
