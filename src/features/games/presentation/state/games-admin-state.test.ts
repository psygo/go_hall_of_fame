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
import {
  GAME_LIMITS,
  type GameErrors,
} from "../../domain/entities/game-draft"
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
  blackPlayerSlug: null,
  whitePlayerSlug: null,
  sgfUrl: null,
  hasUploadedSgf: false,
  featured: false,
  sequence: 0,
}
const detail: GameDetail = {
  ...game,
  players: [],
  resources: [],
}
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

const blankExtras = {
  featured: false,
  sgfFileText: "",
  sgfFileTooLarge: false,
  removeSgf: false,
  blackPlayerSlug: "",
  whitePlayerSlug: "",
  resources: [],
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

    expect(await state.loadAdminGames()).toEqual({
      items: [game],
      page: 1,
      pageCount: 1,
      total: 1,
    })
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

describe("loadAdminGames pagination", () => {
  const many = Array.from({ length: 31 }, (_, index) => ({
    ...game,
    slug: `g${index}`,
  }))

  it("returns the requested page of the admin list", async () => {
    const { state } = buildState({
      listResult: succeed(many),
    })

    const page = await state.loadAdminGames("3")

    expect(page.page).toBe(3)
    expect(page.pageCount).toBe(3)
    expect(page.items).toHaveLength(1)
  })

  it("clamps a page beyond the end and ignores garbage", async () => {
    const { state } = buildState({
      listResult: succeed(many),
    })

    expect((await state.loadAdminGames("99")).page).toBe(3)
    expect((await state.loadAdminGames("abc")).page).toBe(1)
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
  it("passes a null original slug, the fields and the player links when creating", async () => {
    const { state, save } = buildState()

    await expect(
      state.saveFromForm(
        "new",
        buildFormData({
          ...fields,
          blackPlayerSlug: "shusaku",
          whitePlayerSlug: "lee-sedol",
        }),
      ),
    ).rejects.toThrow()

    expect(save).toHaveBeenCalledWith({
      originalSlug: null,
      form: {
        ...fields,
        ...blankExtras,
        blackPlayerSlug: "shusaku",
        whitePlayerSlug: "lee-sedol",
      },
    })
  })

  it("reads an uploaded SGF file and the resource rows", async () => {
    const { state, save } = buildState()
    const formData = buildFormData(fields)
    formData.set(
      "sgfFile",
      new File(["(;GM[1])"], "game.sgf"),
    )
    formData.set("removeSgf", "on")
    formData.append("resourceUrl", "https://example.com")
    formData.append("resourceDescription", "Notes")
    formData.append("resourceUrl", "/local")

    await expect(
      state.saveFromForm("new", formData),
    ).rejects.toThrow()

    expect(save).toHaveBeenCalledWith({
      originalSlug: null,
      form: expect.objectContaining({
        sgfFileText: "(;GM[1])",
        removeSgf: true,
        resources: [
          {
            url: "https://example.com",
            description: "Notes",
          },
          { url: "/local", description: "" },
        ],
      }),
    })
  })

  it("treats an empty file input as no file", async () => {
    const { state, save } = buildState()
    const formData = buildFormData(fields)
    formData.set("sgfFile", new File([], ""))

    await expect(
      state.saveFromForm("new", formData),
    ).rejects.toThrow()

    expect(save).toHaveBeenCalledWith({
      originalSlug: null,
      form: expect.objectContaining({ sgfFileText: "" }),
    })
  })

  it("does not read an oversized file and flags it", async () => {
    const { state, save } = buildState()
    const formData = buildFormData(fields)
    formData.set(
      "sgfFile",
      new File(
        ["x".repeat(GAME_LIMITS.maxSgfBytes + 1)],
        "big.sgf",
      ),
    )

    await expect(
      state.saveFromForm("new", formData),
    ).rejects.toThrow()

    expect(save).toHaveBeenCalledWith({
      originalSlug: null,
      form: expect.objectContaining({
        sgfFileText: "",
        sgfFileTooLarge: true,
      }),
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
      form: { ...fields, ...blankExtras, featured: true },
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
        resources: [],
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
        buildFormData({ ...fields, name: "" }),
      ),
    ).toEqual({
      status: "invalid",
      errors,
      values: {
        ...fields,
        ...blankExtras,
        name: "",
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
      values: { ...fields, ...blankExtras },
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

    await expect(state.deleteBySlug("x")).rejects.toThrow(
      "The change could not be saved.",
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
