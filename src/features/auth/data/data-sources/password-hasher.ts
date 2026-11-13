import {
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto"

const KEY_LENGTH = 64
const COST = 16384 // N
const BLOCK_SIZE = 8 // r
const PARALLELISM = 1 // p
const MAX_MEMORY = 64 * 1024 * 1024

function deriveKey(
  password: string,
  salt: Buffer,
  cost: number,
  blockSize: number,
  parallelism: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      {
        N: cost,
        r: blockSize,
        p: parallelism,
        maxmem: MAX_MEMORY,
      },
      (error, key) =>
        error ? reject(error) : resolve(key),
    )
  })
}

/** Password hashing with scrypt. Hash format: scrypt$N$r$p$salt(base64)$key(base64). */
export class PasswordHasher {
  private readonly dummyHash = this.hash(
    "not-a-real-password",
  )

  async hash(password: string): Promise<string> {
    const salt = randomBytes(16)
    const key = await deriveKey(
      password,
      salt,
      COST,
      BLOCK_SIZE,
      PARALLELISM,
    )
    return [
      "scrypt",
      COST,
      BLOCK_SIZE,
      PARALLELISM,
      salt.toString("base64"),
      key.toString("base64"),
    ].join("$")
  }

  /** A null hash is checked against a throwaway one, so the time taken is the same. */
  async verify(
    password: string,
    hash: string | null,
  ): Promise<boolean> {
    const stored = hash ?? (await this.dummyHash)
    const parts = stored.split("$")
    if (parts.length !== 6 || parts[0] !== "scrypt")
      return false
    const [, cost, blockSize, parallelism, salt, expected] =
      parts
    const settings = [cost, blockSize, parallelism].map(
      Number,
    )
    if (!settings.every(Number.isSafeInteger)) return false
    const expectedKey = Buffer.from(expected, "base64")
    const key = await deriveKey(
      password,
      Buffer.from(salt, "base64"),
      settings[0],
      settings[1],
      settings[2],
    ).catch(() => null)
    if (key === null) return false
    const matches =
      key.length === expectedKey.length &&
      timingSafeEqual(key, expectedKey)
    return matches && hash !== null
  }
}
