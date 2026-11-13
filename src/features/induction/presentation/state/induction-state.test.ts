import {
  describe,
  expect,
  it,
  vi,
  afterEach,
  beforeEach,
} from "vitest"

vi.mock("next/server", () => ({
  connection: vi.fn(async () => undefined),
}))

import { fail, succeed } from "@/core/data-state"

import type { Criterion } from "../../domain/entities/criterion"
import type {
  NominationDraft,
  NominationSubmission,
} from "../../domain/entities/nomination"
import {
  createInductionState,
  type InductionDependencies,
} from "./induction-state"

function buildFormData(
  fields: Record<string, string | File>,
): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value)
  }
  return formData
}

const validFields = {
  name: "Shusaku",
  category: "game",
  email: "fan@example.com",
  caseForInduction: "Reasons",
}

const emptyPage = {
  items: [],
  page: 1,
  pageCount: 1,
  total: 0,
}

function buildState(
  submission: NominationSubmission,
  pageCriteria: ReturnType<typeof vi.fn> = vi.fn(async () =>
    succeed(emptyPage),
  ),
) {
  const submitNomination = vi.fn(async () => submission)
  const dependencies: InductionDependencies = {
    pageCriteria: { call: pageCriteria },
    submitNomination: { call: submitNomination },
  }
  return {
    state: createInductionState(dependencies),
    submitNomination,
  }
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("createInductionState", () => {
  describe("loadCriteriaPage", () => {
    it("passes the parsed order and page and returns the page", async () => {
      const criteria: Criterion[] = [
        {
          id: 1,
          position: 1,
          title: "Mastery",
          text: "Text",
        },
      ]
      const page = {
        ...emptyPage,
        items: criteria,
        total: 1,
      }
      const pageCriteria = vi.fn(async () => succeed(page))
      const { state } = buildState(
        { status: "failed", error: new Error("db down") },
        pageCriteria,
      )

      expect(
        await state.loadCriteriaPage({
          sort: "last",
          page: "2",
        }),
      ).toEqual({ criteria: page, order: "last" })
      expect(pageCriteria).toHaveBeenCalledWith({
        order: "last",
        page: 2,
      })
    })

    it("falls back to the first order and page for garbage", async () => {
      const pageCriteria = vi.fn(async () =>
        succeed(emptyPage),
      )
      const { state } = buildState(
        { status: "failed", error: new Error("db down") },
        pageCriteria,
      )

      await state.loadCriteriaPage({
        sort: "sideways",
        page: "1e3",
      })

      expect(pageCriteria).toHaveBeenCalledWith({
        order: "first",
        page: 1,
      })
    })

    it("throws the original error when the use case fails", async () => {
      const cause = new Error("db down")
      const { state } = buildState(
        { status: "failed", error: new Error("db down") },
        vi.fn(async () => fail(cause)),
      )

      await expect(state.loadCriteriaPage({})).rejects.toBe(
        cause,
      )
    })
  })

  describe("submitNominationForm", () => {
    it("passes the form values to the use case as the draft", async () => {
      const { state, submitNomination } = buildState({
        status: "failed",
        error: new Error("db down"),
      })

      await state.submitNominationForm(
        buildFormData(validFields),
      )

      expect(submitNomination).toHaveBeenCalledWith({
        draft: validFields,
      })
    })

    it("falls back to the player category for an unknown value", async () => {
      const { state, submitNomination } = buildState({
        status: "failed",
        error: new Error("db down"),
      })

      await state.submitNominationForm(
        buildFormData({
          ...validFields,
          category: "timeline",
        }),
      )

      expect(submitNomination).toHaveBeenCalledWith({
        draft: expect.objectContaining({
          category: "player",
        }),
      })
    })

    it("falls back to the player category when the category is missing", async () => {
      const { state, submitNomination } = buildState({
        status: "failed",
        error: new Error("db down"),
      })
      const withoutCategory = {
        name: validFields.name,
        email: validFields.email,
        caseForInduction: validFields.caseForInduction,
      }

      await state.submitNominationForm(
        buildFormData(withoutCategory),
      )

      expect(submitNomination).toHaveBeenCalledWith({
        draft: expect.objectContaining({
          category: "player",
        }),
      })
    })

    it("turns missing fields into empty strings", async () => {
      const { state, submitNomination } = buildState({
        status: "failed",
        error: new Error("db down"),
      })

      await state.submitNominationForm(new FormData())

      expect(submitNomination).toHaveBeenCalledWith({
        draft: {
          name: "",
          category: "player",
          email: "",
          caseForInduction: "",
        },
      })
    })

    it("turns file entries into empty strings", async () => {
      const { state, submitNomination } = buildState({
        status: "failed",
        error: new Error("db down"),
      })
      const file = new File(["x"], "x.txt")

      await state.submitNominationForm(
        buildFormData({ ...validFields, name: file }),
      )

      expect(submitNomination).toHaveBeenCalledWith({
        draft: expect.objectContaining({ name: "" }),
      })
    })

    it("maps an accepted submission to the name and email of the saved draft", async () => {
      const draft: NominationDraft = {
        name: "Trimmed Name",
        category: "game",
        email: "trimmed@example.com",
        caseForInduction: "Reasons",
      }
      const { state } = buildState({
        status: "accepted",
        draft,
      })

      const result = await state.submitNominationForm(
        buildFormData({
          ...validFields,
          name: "  Trimmed Name ",
          email: " trimmed@example.com ",
        }),
      )

      expect(result).toEqual({
        status: "accepted",
        name: "Trimmed Name",
        email: "trimmed@example.com",
      })
    })

    it("maps an invalid submission to its errors and the entered values", async () => {
      const errors = {
        email: "Enter a valid email address.",
      }
      const { state } = buildState({
        status: "invalid",
        errors,
      })

      const result = await state.submitNominationForm(
        buildFormData({ ...validFields, email: "nope" }),
      )

      expect(result).toEqual({
        status: "invalid",
        errors,
        values: { ...validFields, email: "nope" },
      })
    })

    it("logs the underlying error when the submission fails", async () => {
      const logged = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})
      const { state } = buildState({
        status: "failed",
        error: new Error("db down"),
      })

      await state.submitNominationForm(
        buildFormData(validFields),
      )

      expect(logged).toHaveBeenCalledWith(
        "Nomination could not be saved:",
        "Error",
      )
    })

    it("maps a failed submission to the failed state keeping the values", async () => {
      const { state } = buildState({
        status: "failed",
        error: new Error("db down"),
      })

      const result = await state.submitNominationForm(
        buildFormData(validFields),
      )

      expect(result).toEqual({
        status: "failed",
        values: validFields,
      })
    })
  })
})
