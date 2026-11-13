import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"

import {
  ResetEmailDataSource,
  type EmailSettings,
} from "./reset-email-data-source"

const email = {
  to: "ada@example.com",
  name: "Ada",
  link: "https://hall.example/admin/reset-password?token=abc",
  validForMinutes: 60,
}

const configured: EmailSettings = {
  apiKey: "test-key-not-real",
  from: "Hall <noreply@hall.example>",
  isProduction: true,
}

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
  vi.spyOn(console, "info").mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("ResetEmailDataSource without a key", () => {
  const unconfigured = {
    apiKey: null,
    from: null,
  }

  it("prints the link in development and sends nothing", async () => {
    await new ResetEmailDataSource({
      ...unconfigured,
      isProduction: false,
    }).send(email)

    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining(email.link),
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("throws in production without printing the link", async () => {
    await expect(
      new ResetEmailDataSource({
        ...unconfigured,
        isProduction: true,
      }).send(email),
    ).rejects.toThrow("Email is not configured")
    expect(console.info).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("treats a key without a From address as unconfigured", async () => {
    await new ResetEmailDataSource({
      apiKey: "k",
      from: null,
      isProduction: false,
    }).send(email)

    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe("ResetEmailDataSource with a key", () => {
  it("posts a JSON body with Bearer auth and the link in the text", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200 })

    await new ResetEmailDataSource(configured).send(email)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("https://api.resend.com/emails")
    expect(init.method).toBe("POST")
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(init.headers.authorization).toBe(
      "Bearer test-key-not-real",
    )
    const body = JSON.parse(init.body)
    expect(body.from).toBe(configured.from)
    expect(body.to).toEqual(["ada@example.com"])
    expect(body.text).toContain(email.link)
    expect(body.text).toContain("Hello Ada,")
    expect(body.text).toContain("60 minutes")
  })

  it("throws with the status, and not the key, when the service refuses", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 422 })

    const failure = new ResetEmailDataSource(
      configured,
    ).send(email)

    await expect(failure).rejects.toThrow(
      "The email service answered 422",
    )
    await failure.catch((error: Error) => {
      expect(error.message).not.toContain("test-key")
    })
  })

  it("lets a network error through", async () => {
    fetchMock.mockRejectedValue(new TypeError("offline"))

    await expect(
      new ResetEmailDataSource(configured).send(email),
    ).rejects.toThrow("offline")
  })
})
