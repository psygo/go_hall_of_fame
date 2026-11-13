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

import type { Criterion } from "../../domain/entities/criterion"
import type { CriterionErrors } from "../../domain/entities/criterion-draft"
import type { NominationRecord } from "../../domain/entities/nomination-record"
import {
  createInductionAdminState,
  type InductionAdminDependencies,
} from "./induction-admin-state"

const criterion: Criterion = {
  id: 4,
  position: 1,
  title: "Mastery",
  text: "Text",
}
const nomination: NominationRecord = {
  id: 6,
  name: "Shusaku",
  category: "player",
  email: "fan@example.com",
  caseForInduction: "Reasons",
  status: "pending",
  createdAt: new Date("2026-01-01T00:00:00Z"),
}

const fields = {
  position: "1",
  title: "Mastery",
  text: "Text",
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

type Outcome<T> =
  ReturnType<typeof succeed<T>> | ReturnType<typeof fail>

function buildState({
  requireAdmin = vi.fn(async () => undefined),
  saveResult = { status: "saved" },
  getResult = succeed<Criterion | null>(criterion),
  listResult = succeed<readonly Criterion[]>([criterion]),
  deleteCriterionResult = succeed(undefined),
  nominationsResult = succeed<readonly NominationRecord[]>([
    nomination,
  ]),
  statusResult = succeed(undefined),
  deleteNominationResult = succeed(undefined),
}: {
  requireAdmin?: ReturnType<typeof vi.fn>
  saveResult?: SaveResult<CriterionErrors>
  getResult?: Outcome<Criterion | null>
  listResult?: Outcome<readonly Criterion[]>
  deleteCriterionResult?: Outcome<void>
  nominationsResult?: Outcome<readonly NominationRecord[]>
  statusResult?: Outcome<void>
  deleteNominationResult?: Outcome<void>
} = {}) {
  const useCases = {
    listCriteria: vi.fn(async () => listResult),
    getCriterion: vi.fn(async () => getResult),
    saveCriterion: vi.fn(async () => saveResult),
    deleteCriterion: vi.fn(
      async () => deleteCriterionResult,
    ),
    listNominations: vi.fn(async () => nominationsResult),
    setNominationStatus: vi.fn(async () => statusResult),
    deleteNomination: vi.fn(
      async () => deleteNominationResult,
    ),
  }
  const dependencies: InductionAdminDependencies = {
    requireAdmin,
    listCriteria: { call: useCases.listCriteria },
    getCriterion: { call: useCases.getCriterion },
    saveCriterion: { call: useCases.saveCriterion },
    deleteCriterion: { call: useCases.deleteCriterion },
    listNominations: { call: useCases.listNominations },
    setNominationStatus: {
      call: useCases.setNominationStatus,
    },
    deleteNomination: { call: useCases.deleteNomination },
  }
  return {
    state: createInductionAdminState(dependencies),
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

describe("loadAdminCriteria", () => {
  it("returns the criteria after checking the admin", async () => {
    const { state, requireAdmin, listCriteria } =
      buildState()

    expect(await state.loadAdminCriteria()).toEqual({
      items: [criterion],
      page: 1,
      pageCount: 1,
      total: 1,
    })
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(listCriteria.mock.invocationCallOrder[0])
  })

  it("does not list anything when the admin check rejects", async () => {
    const { state, listCriteria } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.loadAdminCriteria()).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(listCriteria).not.toHaveBeenCalled()
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { state } = buildState({
      listResult: fail(cause),
    })

    await expect(state.loadAdminCriteria()).rejects.toBe(
      cause,
    )
  })
})

describe("loadCriterionEditor", () => {
  it("returns null for new without a lookup", async () => {
    const { state, getCriterion } = buildState()

    expect(
      await state.loadCriterionEditor("new"),
    ).toBeNull()
    expect(getCriterion).not.toHaveBeenCalled()
  })

  it("returns the criterion of a numeric id", async () => {
    const { state, getCriterion, requireAdmin } =
      buildState()

    expect(await state.loadCriterionEditor("4")).toEqual(
      criterion,
    )
    expect(getCriterion).toHaveBeenCalledWith({ id: 4 })
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(getCriterion.mock.invocationCallOrder[0])
  })

  it("is a 404 for an unknown id", async () => {
    const { state } = buildState({
      getResult: succeed(null),
    })

    await expect(
      state.loadCriterionEditor("99"),
    ).rejects.toThrow("NEXT_NOT_FOUND")
  })

  it("is a 404 for a non-numeric id, without a lookup", async () => {
    const { state, getCriterion } = buildState()

    await expect(
      state.loadCriterionEditor("abc"),
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(getCriterion).not.toHaveBeenCalled()
  })

  it.each(["new", "4"])(
    "checks the admin first even for %s",
    async (param) => {
      const { state, getCriterion } = buildState({
        requireAdmin: rejectingAdmin(),
      })

      await expect(
        state.loadCriterionEditor(param),
      ).rejects.toThrow("NEXT_REDIRECT:/admin/sign-in")
      expect(getCriterion).not.toHaveBeenCalled()
    },
  )

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { state } = buildState({ getResult: fail(cause) })

    await expect(
      state.loadCriterionEditor("4"),
    ).rejects.toBe(cause)
  })
})

describe("saveCriterionFromForm", () => {
  it("passes a null id and the form values when creating", async () => {
    const { state, saveCriterion } = buildState()

    await expect(
      state.saveCriterionFromForm(
        "new",
        buildFormData(fields),
      ),
    ).rejects.toThrow()

    expect(saveCriterion).toHaveBeenCalledWith({
      id: null,
      form: fields,
    })
  })

  it("passes the numeric id when editing", async () => {
    const { state, saveCriterion } = buildState()

    await expect(
      state.saveCriterionFromForm(
        "4",
        buildFormData(fields),
      ),
    ).rejects.toThrow()

    expect(saveCriterion).toHaveBeenCalledWith({
      id: 4,
      form: fields,
    })
  })

  it("turns missing fields into empty strings", async () => {
    const { state, saveCriterion } = buildState({
      saveResult: { status: "invalid", errors: {} },
    })

    await state.saveCriterionFromForm("new", new FormData())

    expect(saveCriterion).toHaveBeenCalledWith({
      id: null,
      form: { position: "", title: "", text: "" },
    })
  })

  it("revalidates the site and redirects to the list when saved", async () => {
    const { state } = buildState()

    await expect(
      state.saveCriterionFromForm(
        "new",
        buildFormData(fields),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/criteria")

    expect(revalidatePath).toHaveBeenCalledWith(
      "/",
      "layout",
    )
  })

  it("maps an invalid result to the invalid state with the entered values", async () => {
    const errors = { title: "Enter a title." }
    const { state } = buildState({
      saveResult: { status: "invalid", errors },
    })

    expect(
      await state.saveCriterionFromForm(
        "new",
        buildFormData({ ...fields, title: "" }),
      ),
    ).toEqual({
      status: "invalid",
      errors,
      values: { ...fields, title: "" },
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
      await state.saveCriterionFromForm(
        "new",
        buildFormData(fields),
      ),
    ).toEqual({
      status: "failed",
      message:
        "The criterion could not be saved. Try again in a moment.",
      values: fields,
    })
    expect(logged).toHaveBeenCalledWith(
      "Could not save the criterion:",
      "TypeError",
    )
  })

  it("does not save when the admin check rejects", async () => {
    const { state, saveCriterion } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(
      state.saveCriterionFromForm(
        "new",
        buildFormData(fields),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/sign-in")
    expect(saveCriterion).not.toHaveBeenCalled()
  })
})

describe("deleteCriterionById", () => {
  it("deletes, revalidates and redirects to the list", async () => {
    const { state, deleteCriterion } = buildState()

    await expect(
      state.deleteCriterionById(4),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/criteria")

    expect(deleteCriterion).toHaveBeenCalledWith({ id: 4 })
    expect(revalidatePath).toHaveBeenCalledWith(
      "/",
      "layout",
    )
  })

  it("throws the failure without revalidating or redirecting", async () => {
    const cause = new Error("db down")
    const { state } = buildState({
      deleteCriterionResult: fail(cause),
    })

    await expect(
      state.deleteCriterionById(4),
    ).rejects.toThrow("The change could not be saved.")
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it("does not delete when the admin check rejects", async () => {
    const { state, deleteCriterion } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(
      state.deleteCriterionById(4),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/sign-in")
    expect(deleteCriterion).not.toHaveBeenCalled()
  })
})

describe("loadNominations", () => {
  it("returns the nominations after checking the admin", async () => {
    const { state, requireAdmin, listNominations } =
      buildState()

    expect(await state.loadNominations()).toEqual({
      items: [nomination],
      page: 1,
      pageCount: 1,
      total: 1,
    })
    expect(
      requireAdmin.mock.invocationCallOrder[0],
    ).toBeLessThan(
      listNominations.mock.invocationCallOrder[0],
    )
  })

  it("does not list anything when the admin check rejects", async () => {
    const { state, listNominations } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(state.loadNominations()).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
    expect(listNominations).not.toHaveBeenCalled()
  })

  it("throws the original error when the use case fails", async () => {
    const cause = new Error("db down")
    const { state } = buildState({
      nominationsResult: fail(cause),
    })

    await expect(state.loadNominations()).rejects.toBe(
      cause,
    )
  })
})

describe("setNominationStatus", () => {
  it.each(["pending", "accepted", "declined"])(
    "sets the status %s, revalidates and redirects",
    async (status) => {
      const { state, setNominationStatus } = buildState()

      await expect(
        state.setNominationStatus(6, status),
      ).rejects.toThrow("NEXT_REDIRECT:/admin/nominations")

      expect(setNominationStatus).toHaveBeenCalledWith({
        id: 6,
        status,
      })
      expect(revalidatePath).toHaveBeenCalledWith(
        "/admin/nominations",
      )
    },
  )

  it.each(["archived", "", "ACCEPTED", "accepted "])(
    "rejects the unknown status %j without calling the use case",
    async (status) => {
      const { state, setNominationStatus } = buildState()

      await expect(
        state.setNominationStatus(6, status),
      ).rejects.toThrow("Unknown status")
      expect(setNominationStatus).not.toHaveBeenCalled()
    },
  )

  it("throws the failure without revalidating or redirecting", async () => {
    const cause = new Error("db down")
    const { state } = buildState({
      statusResult: fail(cause),
    })

    await expect(
      state.setNominationStatus(6, "accepted"),
    ).rejects.toThrow("The change could not be saved.")
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it("does nothing when the admin check rejects, even for an unknown status", async () => {
    const { state, setNominationStatus } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(
      state.setNominationStatus(6, "archived"),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/sign-in")
    expect(setNominationStatus).not.toHaveBeenCalled()
  })
})

describe("deleteNominationById", () => {
  it("deletes, revalidates and redirects to the nominations", async () => {
    const { state, deleteNomination } = buildState()

    await expect(
      state.deleteNominationById(6),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/nominations")

    expect(deleteNomination).toHaveBeenCalledWith({ id: 6 })
    expect(revalidatePath).toHaveBeenCalledWith(
      "/admin/nominations",
    )
  })

  it("throws the failure without revalidating or redirecting", async () => {
    const cause = new Error("db down")
    const { state } = buildState({
      deleteNominationResult: fail(cause),
    })

    await expect(
      state.deleteNominationById(6),
    ).rejects.toThrow("The change could not be saved.")
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it("does not delete when the admin check rejects", async () => {
    const { state, deleteNomination } = buildState({
      requireAdmin: rejectingAdmin(),
    })

    await expect(
      state.deleteNominationById(6),
    ).rejects.toThrow("NEXT_REDIRECT:/admin/sign-in")
    expect(deleteNomination).not.toHaveBeenCalled()
  })
})

describe("admin list pagination", () => {
  const criteria = Array.from(
    { length: 16 },
    (_, index) => ({
      ...criterion,
      id: index + 1,
    }),
  )
  const nominations = Array.from(
    { length: 31 },
    (_, index) => ({
      ...nomination,
      id: index + 1,
    }),
  )

  it("pages the criteria, clamping and ignoring garbage", async () => {
    const { state } = buildState({
      listResult: succeed(criteria),
    })

    expect(
      (await state.loadAdminCriteria("2")).items,
    ).toHaveLength(1)
    expect((await state.loadAdminCriteria("99")).page).toBe(
      2,
    )
    expect((await state.loadAdminCriteria("-1")).page).toBe(
      1,
    )
  })

  it("pages the nominations, clamping and ignoring garbage", async () => {
    const { state } = buildState({
      nominationsResult: succeed(nominations),
    })

    expect(
      (await state.loadNominations("3")).items,
    ).toHaveLength(1)
    expect((await state.loadNominations("99")).page).toBe(3)
    expect((await state.loadNominations("zz")).page).toBe(1)
  })
})
