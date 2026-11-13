import { describe, expect, it, vi } from "vitest"

import type { PasswordHasher } from "../data-sources/password-hasher"
import { PasswordEncoderImpl } from "./password-encoder-impl"

describe("PasswordEncoderImpl", () => {
  it("hashes through the hasher", async () => {
    const hash = vi.fn(async () => "stored")
    const encoder = new PasswordEncoderImpl({
      hash,
    } as unknown as PasswordHasher)

    expect(await encoder.hash("secret-password")).toBe(
      "stored",
    )
    expect(hash).toHaveBeenCalledWith("secret-password")
  })
})
