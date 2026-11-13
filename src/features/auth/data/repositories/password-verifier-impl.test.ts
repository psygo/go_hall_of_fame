import { describe, expect, it, vi } from "vitest"

import type { PasswordHasher } from "../data-sources/password-hasher"
import { PasswordVerifierImpl } from "./password-verifier-impl"

function buildVerifier(verify: ReturnType<typeof vi.fn>) {
  return new PasswordVerifierImpl({
    verify,
  } as unknown as PasswordHasher)
}

describe("PasswordVerifierImpl", () => {
  it.each([true, false])(
    "returns the verdict of the hasher (%s)",
    async (verdict) => {
      const verify = vi.fn(async () => verdict)

      const result = await buildVerifier(verify).verify(
        "pw",
        "hash",
      )

      expect(verify).toHaveBeenCalledWith("pw", "hash")
      expect(result).toBe(verdict)
    },
  )

  it("passes a null hash through to the hasher", async () => {
    const verify = vi.fn(async () => false)

    await buildVerifier(verify).verify("pw", null)

    expect(verify).toHaveBeenCalledWith("pw", null)
  })
})
