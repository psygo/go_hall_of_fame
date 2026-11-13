import { describe, expect, it } from "vitest"

import { PasswordHasher } from "./password-hasher"

describe("PasswordHasher", () => {
  const hasher = new PasswordHasher()

  it("formats the hash as scrypt$N$r$p$salt$key", async () => {
    const hash = await hasher.hash("correct horse battery")

    const parts = hash.split("$")
    expect(hash.startsWith("scrypt$")).toBe(true)
    expect(parts).toHaveLength(6)
    expect(parts.slice(1, 4)).toEqual(["16384", "8", "1"])
    expect(Buffer.from(parts[4], "base64")).toHaveLength(16)
    expect(Buffer.from(parts[5], "base64")).toHaveLength(64)
  })

  it("never contains the password", async () => {
    const hash = await hasher.hash("correct horse battery")

    expect(hash).not.toContain("correct horse battery")
  })

  it("verifies the right password", async () => {
    const hash = await hasher.hash("correct horse battery")

    expect(
      await hasher.verify("correct horse battery", hash),
    ).toBe(true)
  })

  it("rejects a wrong password", async () => {
    const hash = await hasher.hash("correct horse battery")

    expect(
      await hasher.verify("wrong password!", hash),
    ).toBe(false)
    expect(
      await hasher.verify("Correct horse battery", hash),
    ).toBe(false)
    expect(await hasher.verify("", hash)).toBe(false)
  })

  it("produces a different hash each time for the same password", async () => {
    const [first, second] = await Promise.all([
      hasher.hash("same password"),
      hasher.hash("same password"),
    ])

    expect(first).not.toBe(second)
    expect(
      await hasher.verify("same password", first),
    ).toBe(true)
    expect(
      await hasher.verify("same password", second),
    ).toBe(true)
  })

  it("handles non-ASCII passwords", async () => {
    const hash = await hasher.hash("パスワード🔑")

    expect(await hasher.verify("パスワード🔑", hash)).toBe(
      true,
    )
    expect(await hasher.verify("パスワード", hash)).toBe(
      false,
    )
  })

  it("verifies false for a null hash, after doing the work", async () => {
    const started = performance.now()
    const result = await hasher.verify("anything", null)
    const elapsed = performance.now() - started

    expect(result).toBe(false)
    // A real scrypt run at N=16384 takes well over a millisecond.
    expect(elapsed).toBeGreaterThan(1)
  })

  it("does not accept the throwaway password against a null hash", async () => {
    expect(
      await hasher.verify("not-a-real-password", null),
    ).toBe(false)
  })

  it.each([
    ["the empty string", ""],
    ["no separators", "scrypt"],
    ["too few parts", "scrypt$16384$8$1$c2FsdA=="],
    [
      "too many parts",
      "scrypt$16384$8$1$c2FsdA==$a2V5$extra",
    ],
    ["another algorithm", "bcrypt$16384$8$1$c2FsdA==$a2V5"],
    ["plain text", "not a hash at all"],
  ])(
    "returns false for a malformed hash: %s",
    async (_label, hash) => {
      expect(await hasher.verify("pw", hash)).toBe(false)
    },
  )

  it("rejects a hash whose key was truncated", async () => {
    const hash = await hasher.hash("pw-for-truncation")
    const parts = hash.split("$")
    parts[5] = parts[5].slice(0, 20)

    expect(
      await hasher.verify(
        "pw-for-truncation",
        parts.join("$"),
      ),
    ).toBe(false)
  })

  it("rejects a hash whose key was altered", async () => {
    const hash = await hasher.hash("pw-for-altering")
    const parts = hash.split("$")
    const key = Buffer.from(parts[5], "base64")
    key[0] ^= 0xff
    parts[5] = key.toString("base64")

    expect(
      await hasher.verify(
        "pw-for-altering",
        parts.join("$"),
      ),
    ).toBe(false)
  })

  it("rejects a hash with malformed cost parameters", async () => {
    expect(
      await hasher.verify(
        "pw",
        "scrypt$abc$8$1$c2FsdA==$a2V5",
      ),
    ).toBe(false)
    expect(
      await hasher.verify(
        "pw",
        "scrypt$3$8$1$c2FsdA==$a2V5",
      ),
    ).toBe(false)
  })
})
