import { describe, expect, it, vi } from "vitest"

import type { ResetEmailDataSource } from "../data-sources/reset-email-data-source"
import { ResetMailerImpl } from "./reset-mailer-impl"

const email = {
  to: "a@b.c",
  name: "Ada",
  link: "https://x.example/r?token=t",
  validForMinutes: 60,
}

function build(send: ReturnType<typeof vi.fn>) {
  return new ResetMailerImpl({
    send,
  } as unknown as ResetEmailDataSource)
}

describe("ResetMailerImpl", () => {
  it("sends through the data source and succeeds", async () => {
    const send = vi.fn(async () => undefined)

    expect(await build(send).send(email)).toEqual({
      status: "success",
      data: undefined,
    })
    expect(send).toHaveBeenCalledWith(email)
  })

  it("turns a thrown error into a failure", async () => {
    const cause = new Error("503")

    expect(
      await build(
        vi.fn(async () => {
          throw cause
        }),
      ).send(email),
    ).toEqual({ status: "failure", error: cause })
  })
})
