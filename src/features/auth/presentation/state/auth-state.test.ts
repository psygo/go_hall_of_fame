import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"

const cookieStore = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
}))

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}))
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
  }),
}))
const afterCallbacks = vi.hoisted(
  () => [] as Array<() => Promise<void> | void>,
)
vi.mock("next/server", () => ({
  connection: vi.fn(async () => undefined),
  after: vi.fn((fn: () => Promise<void> | void) => {
    afterCallbacks.push(fn)
  }),
}))
vi.mock("react", () => ({
  cache: <T>(fn: T) => fn,
}))

import { connection } from "next/server"

import { fail, succeed } from "@/core/data-state"

import type { Admin } from "../../domain/entities/admin"
import type {
  RequestResetResult,
  ResetPasswordResult,
} from "../../domain/entities/password-reset"
import type { SignInResult } from "../../domain/entities/sign-in-result"
import {
  createAuthState,
  SESSION_COOKIE,
  type AuthDependencies,
} from "./auth-state"

const admin: Admin = {
  id: 1,
  name: "Ada",
  email: "ada@example.com",
}
const expiresAt = new Date("2026-05-08T12:00:00Z")

function buildFormData(
  fields: Record<string, string | File>,
): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value)
  }
  return formData
}

function buildState({
  signInResult = {
    status: "signed-in",
    admin,
    token: "tok",
    expiresAt,
  },
  endResult = succeed(undefined),
  lookupResult = succeed<Admin | null>(admin),
}: {
  signInResult?: SignInResult
  endResult?:
    | ReturnType<typeof succeed<void>>
    | ReturnType<typeof fail>
  lookupResult?:
    | ReturnType<typeof succeed<Admin | null>>
    | ReturnType<typeof fail>
} = {}) {
  const signIn = vi.fn(async () => signInResult)
  const signOut = vi.fn(async () => endResult)
  const getAdminBySession = vi.fn(async () => lookupResult)
  const requestPasswordReset = vi.fn(
    async (): Promise<RequestResetResult> => ({
      status: "requested",
      error: null,
      deliver: null,
    }),
  )
  const checkResetLink = vi.fn(async () => succeed(true))
  const resetPassword = vi.fn(
    async (): Promise<ResetPasswordResult> => ({
      status: "reset",
    }),
  )
  const dependencies: AuthDependencies = {
    signIn: { call: signIn },
    signOut: { call: signOut },
    getAdminBySession: { call: getAdminBySession },
    requestPasswordReset: { call: requestPasswordReset },
    checkResetLink: { call: checkResetLink },
    resetPassword: { call: resetPassword },
  }
  return {
    state: createAuthState(dependencies),
    signIn,
    signOut,
    getAdminBySession,
    requestPasswordReset,
    checkResetLink,
    resetPassword,
  }
}

function hasCookie(token: string | undefined) {
  cookieStore.get.mockImplementation((name: string) =>
    name === SESSION_COOKIE && token !== undefined
      ? { name, value: token }
      : undefined,
  )
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
  hasCookie(undefined)
  afterCallbacks.length = 0
})

afterEach(() => {
  vi.restoreAllMocks()
  cookieStore.get.mockReset()
  cookieStore.set.mockReset()
  cookieStore.delete.mockReset()
})

describe("signInWithForm", () => {
  const valid = { email: "ada@example.com", password: "pw" }

  it.each([
    ["an empty email", { ...valid, email: "" }],
    ["an empty password", { ...valid, password: "" }],
    [
      "an email over 254 characters",
      { ...valid, email: "a".repeat(255) },
    ],
    [
      "a password over 256 characters",
      { ...valid, password: "a".repeat(257) },
    ],
  ])(
    "rejects %s without calling the use case",
    async (_label, fields) => {
      const { state, signIn } = buildState()

      const result = await state.signInWithForm(
        buildFormData(fields),
      )

      expect(result).toEqual({
        status: "rejected",
        message: "Enter your email and password.",
        email: fields.email,
      })
      expect(signIn).not.toHaveBeenCalled()
    },
  )

  it("accepts the maximum lengths", async () => {
    const { state, signIn } = buildState({
      signInResult: { status: "invalid" },
    })

    await state.signInWithForm(
      buildFormData({
        email: "a".repeat(254),
        password: "a".repeat(256),
      }),
    )

    expect(signIn).toHaveBeenCalledTimes(1)
  })

  it("treats missing and file fields as empty", async () => {
    const { state, signIn } = buildState()

    const result = await state.signInWithForm(
      buildFormData({ email: new File(["x"], "x.txt") }),
    )

    expect(result).toEqual({
      status: "rejected",
      message: "Enter your email and password.",
      email: "",
    })
    expect(signIn).not.toHaveBeenCalled()
  })

  it("passes the email and password to the use case", async () => {
    const { state, signIn } = buildState({
      signInResult: { status: "invalid" },
    })

    await state.signInWithForm(buildFormData(valid))

    expect(signIn).toHaveBeenCalledWith(valid)
  })

  it("keeps the typed email when rejecting", async () => {
    const { state } = buildState({
      signInResult: { status: "invalid" },
    })

    expect(
      await state.signInWithForm(buildFormData(valid)),
    ).toEqual({
      status: "rejected",
      message: "Invalid email or password.",
      email: "ada@example.com",
    })
  })

  it("explains a lock without saying whether the email exists", async () => {
    const { state } = buildState({
      signInResult: { status: "locked", until: expiresAt },
    })

    expect(
      await state.signInWithForm(buildFormData(valid)),
    ).toEqual({
      status: "rejected",
      message:
        "Too many attempts. Try again in about 15 minutes.",
      email: "ada@example.com",
    })
  })

  it("asks to try again later on a failure, logging only the error name", async () => {
    const logged = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})
    const { state } = buildState({
      signInResult: {
        status: "failed",
        error: new Error("password=secret"),
      },
    })

    const result = await state.signInWithForm(
      buildFormData(valid),
    )

    expect(result).toEqual({
      status: "rejected",
      message: "Could not sign in. Try again in a moment.",
      email: "ada@example.com",
    })
    expect(logged).toHaveBeenCalledWith(
      "Sign-in failed:",
      "Error",
    )
  })

  it("does not set a cookie when the sign-in is rejected", async () => {
    const { state } = buildState({
      signInResult: { status: "invalid" },
    })

    await state.signInWithForm(buildFormData(valid))

    expect(cookieStore.set).not.toHaveBeenCalled()
  })

  it("on success sets a httpOnly, lax, site-wide cookie that expires with the session, then redirects to /admin", async () => {
    const { state } = buildState()

    await expect(
      state.signInWithForm(buildFormData(valid)),
    ).rejects.toThrow("NEXT_REDIRECT:/admin")

    expect(cookieStore.set).toHaveBeenCalledWith(
      SESSION_COOKIE,
      "tok",
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
      },
    )
  })

  it("sets the cookie before it redirects", async () => {
    const { state } = buildState()
    const order: string[] = []
    cookieStore.set.mockImplementation(() => {
      order.push("set")
    })

    await state
      .signInWithForm(buildFormData(valid))
      .catch(() => order.push("redirect"))

    expect(order).toEqual(["set", "redirect"])
  })
})

describe("signOutCurrent", () => {
  it("ends the session, deletes the cookie, then redirects to /", async () => {
    hasCookie("tok")
    const { state, signOut } = buildState()

    await expect(state.signOutCurrent()).rejects.toThrow(
      "NEXT_REDIRECT:/",
    )

    expect(signOut).toHaveBeenCalledWith({ token: "tok" })
    expect(cookieStore.delete).toHaveBeenCalledWith(
      SESSION_COOKIE,
    )
  })

  it("only deletes the cookie when there is no session", async () => {
    const { state, signOut } = buildState()

    await expect(state.signOutCurrent()).rejects.toThrow(
      "NEXT_REDIRECT:/",
    )

    expect(signOut).not.toHaveBeenCalled()
    expect(cookieStore.delete).toHaveBeenCalledWith(
      SESSION_COOKIE,
    )
  })

  it("still deletes the cookie and redirects when ending the session fails", async () => {
    hasCookie("tok")
    const logged = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})
    const { state } = buildState({
      endResult: fail(new Error("db down")),
    })

    await expect(state.signOutCurrent()).rejects.toThrow(
      "NEXT_REDIRECT:/",
    )

    expect(cookieStore.delete).toHaveBeenCalledWith(
      SESSION_COOKIE,
    )
    expect(logged).toHaveBeenCalledWith(
      "Could not end the admin session:",
      "Error",
    )
  })
})

describe("loadCurrentAdmin", () => {
  it("waits for the request with connection()", async () => {
    const { state } = buildState()

    await state.loadCurrentAdmin()

    expect(connection).toHaveBeenCalled()
  })

  it("returns null without a lookup when there is no cookie", async () => {
    const { state, getAdminBySession } = buildState()

    expect(await state.loadCurrentAdmin()).toBeNull()
    expect(getAdminBySession).not.toHaveBeenCalled()
  })

  it("returns the admin of the cookie's session", async () => {
    hasCookie("tok")
    const { state, getAdminBySession } = buildState()

    expect(await state.loadCurrentAdmin()).toEqual(admin)
    expect(getAdminBySession).toHaveBeenCalledWith({
      token: "tok",
    })
  })

  it("returns null for an unknown or expired token", async () => {
    hasCookie("tok")
    const { state } = buildState({
      lookupResult: succeed(null),
    })

    expect(await state.loadCurrentAdmin()).toBeNull()
  })

  it("returns null and logs only the error name when the lookup fails", async () => {
    hasCookie("tok")
    const logged = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})
    const { state } = buildState({
      lookupResult: fail(new Error("secret detail")),
    })

    expect(await state.loadCurrentAdmin()).toBeNull()
    expect(logged).toHaveBeenCalledWith(
      "Could not check the admin session:",
      "Error",
    )
  })
})

describe("requireAdmin", () => {
  it("returns the admin when signed in", async () => {
    hasCookie("tok")
    const { state } = buildState()

    expect(await state.requireAdmin()).toEqual(admin)
  })

  it("redirects to the sign-in page when there is no cookie", async () => {
    const { state } = buildState()

    await expect(state.requireAdmin()).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
  })

  it("redirects to the sign-in page when the session is unknown", async () => {
    hasCookie("tok")
    const { state } = buildState({
      lookupResult: succeed(null),
    })

    await expect(state.requireAdmin()).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
  })

  it("redirects to the sign-in page when the lookup fails", async () => {
    hasCookie("tok")
    const { state } = buildState({
      lookupResult: fail(new Error("db down")),
    })

    await expect(state.requireAdmin()).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in",
    )
  })
})

describe("requestResetFromForm", () => {
  it.each([
    ["a blank email", "   "],
    ["an email over 254 characters", "a".repeat(255)],
  ])(
    "rejects %s without calling the use case",
    async (_n, email) => {
      const { state, requestPasswordReset } = buildState()

      const result = await state.requestResetFromForm(
        buildFormData({ email }),
      )

      expect(result).toMatchObject({ status: "rejected" })
      expect(requestPasswordReset).not.toHaveBeenCalled()
    },
  )

  it("trims the email and answers sent", async () => {
    const { state, requestPasswordReset } = buildState()

    expect(
      await state.requestResetFromForm(
        buildFormData({ email: "  ada@example.com " }),
      ),
    ).toEqual({ status: "sent" })
    expect(requestPasswordReset).toHaveBeenCalledWith({
      email: "ada@example.com",
    })
  })

  it("answers sent and sends nothing when there is nothing to deliver", async () => {
    const { state } = buildState()

    expect(
      await state.requestResetFromForm(
        buildFormData({ email: "nobody@example.com" }),
      ),
    ).toEqual({ status: "sent" })
    expect(afterCallbacks).toHaveLength(0)
  })

  it("logs why nothing was prepared by error name only, and still answers sent", async () => {
    const { state, requestPasswordReset } = buildState()
    requestPasswordReset.mockResolvedValue({
      status: "requested",
      error: new TypeError("secret ada@example.com"),
      deliver: null,
    })

    expect(
      await state.requestResetFromForm(
        buildFormData({ email: "ada@example.com" }),
      ),
    ).toEqual({ status: "sent" })
    expect(console.error).toHaveBeenCalledWith(
      "Could not prepare the password reset email:",
      "TypeError",
    )
  })

  it("runs deliver after the response, not before", async () => {
    const { state, requestPasswordReset } = buildState()
    const deliver = vi.fn(async () => null)
    requestPasswordReset.mockResolvedValue({
      status: "requested",
      error: null,
      deliver,
    })

    expect(
      await state.requestResetFromForm(
        buildFormData({ email: "ada@example.com" }),
      ),
    ).toEqual({ status: "sent" })
    expect(deliver).not.toHaveBeenCalled()

    await afterCallbacks[0]()

    expect(deliver).toHaveBeenCalledTimes(1)
    expect(console.error).not.toHaveBeenCalled()
  })

  it("logs a delivery failure by error name only", async () => {
    const { state, requestPasswordReset } = buildState()
    requestPasswordReset.mockResolvedValue({
      status: "requested",
      error: null,
      deliver: async () =>
        new RangeError("to ada@example.com"),
    })

    await state.requestResetFromForm(
      buildFormData({ email: "ada@example.com" }),
    )
    await afterCallbacks[0]()

    expect(console.error).toHaveBeenCalledWith(
      "Could not send the password reset email:",
      "RangeError",
    )
  })

  it("rejects with a generic message when the use case fails", async () => {
    const { state, requestPasswordReset } = buildState()
    requestPasswordReset.mockResolvedValue({
      status: "failed",
      error: new Error("db down"),
    })

    expect(
      await state.requestResetFromForm(
        buildFormData({ email: "ada@example.com" }),
      ),
    ).toEqual({
      status: "rejected",
      message:
        "Could not send the link. Try again in a moment.",
      email: "ada@example.com",
    })
  })
})

describe("loadResetLink", () => {
  it.each(["", "t".repeat(129)])(
    "is not usable for the token %j without a lookup",
    async (token) => {
      const { state, checkResetLink } = buildState()

      expect(await state.loadResetLink(token)).toEqual({
        isUsable: false,
      })
      expect(checkResetLink).not.toHaveBeenCalled()
    },
  )

  it("returns what the use case says", async () => {
    const { state, checkResetLink } = buildState()
    checkResetLink
      .mockResolvedValueOnce(succeed(true))
      .mockResolvedValueOnce(succeed(false))

    expect(await state.loadResetLink("t")).toEqual({
      isUsable: true,
    })
    expect(await state.loadResetLink("t")).toEqual({
      isUsable: false,
    })
  })

  it("is not usable when the check fails", async () => {
    const { state, checkResetLink } = buildState()
    checkResetLink.mockResolvedValue(
      fail(new Error("db down")) as never,
    )

    expect(await state.loadResetLink("t")).toEqual({
      isUsable: false,
    })
  })
})

describe("resetPasswordFromForm", () => {
  const fields = {
    password: "a-long-enough-password",
    confirmation: "a-long-enough-password",
  }

  it("redirects to the sign-in page when the password is reset", async () => {
    const { state, resetPassword } = buildState()

    await expect(
      state.resetPasswordFromForm(
        "tok",
        buildFormData(fields),
      ),
    ).rejects.toThrow(
      "NEXT_REDIRECT:/admin/sign-in?reset=done",
    )
    expect(resetPassword).toHaveBeenCalledWith({
      token: "tok",
      ...fields,
    })
  })

  it.each([
    [
      "a token over 128 characters",
      "t".repeat(129),
      fields,
    ],
    [
      "a password over 256 characters",
      "tok",
      { ...fields, password: "a".repeat(257) },
    ],
    [
      "a confirmation over 256 characters",
      "tok",
      { ...fields, confirmation: "a".repeat(257) },
    ],
  ])(
    "rejects %s as an expired link without the use case",
    async (_n, token, input) => {
      const { state, resetPassword } = buildState()

      expect(
        await state.resetPasswordFromForm(
          token,
          buildFormData(input),
        ),
      ).toEqual({
        status: "rejected",
        message:
          "This link has expired or was already used. Ask for a new one.",
      })
      expect(resetPassword).not.toHaveBeenCalled()
    },
  )

  it.each([
    ["weak", /at least 12 characters/],
    ["mismatch", /do not match/],
    ["invalid-link", /expired or was already used/],
  ] as const)(
    "describes the %s result",
    async (status, message) => {
      const { state, resetPassword } = buildState()
      resetPassword.mockResolvedValue({ status })

      const result = await state.resetPasswordFromForm(
        "tok",
        buildFormData(fields),
      )

      expect(result).toMatchObject({ status: "rejected" })
      expect(
        result.status === "rejected" && result.message,
      ).toMatch(message)
    },
  )

  it("describes a failure generically, logging only the error name", async () => {
    const { state, resetPassword } = buildState()
    resetPassword.mockResolvedValue({
      status: "failed",
      error: new RangeError("hash for ada"),
    })

    const result = await state.resetPasswordFromForm(
      "tok",
      buildFormData(fields),
    )

    expect(result).toEqual({
      status: "rejected",
      message:
        "Could not save the password. Try again in a moment.",
    })
    expect(console.error).toHaveBeenCalledWith(
      "Password reset failed:",
      "RangeError",
    )
  })
})
