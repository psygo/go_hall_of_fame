import { createInterface } from "node:readline"
import { Writable } from "node:stream"

import { config } from "dotenv"
import { eq } from "drizzle-orm"

import { PasswordHasher } from "../src/features/auth/data/data-sources/password-hasher"
import {
  isPasswordLongEnough,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "../src/features/auth/domain/entities/admin"
import {
  createDatabase,
  readConnectionString,
} from "../src/shared/database/data/database"
import { adminsTable } from "../src/shared/database/data/schema"

// Creates an admin, or resets the password of an existing one. Run it against the database you
// mean to change: it uses DATABASE_URL (or POSTGRES_URL) from the environment, then .env.local.
config({ path: ".env.local" })

function ask(
  question: string,
  hidden = false,
): Promise<string> {
  let muted = false
  const output = new Writable({
    write(chunk, _encoding, done) {
      if (!muted) process.stdout.write(chunk)
      done()
    },
  })
  const reader = createInterface({
    input: process.stdin,
    output,
    terminal: true,
  })
  return new Promise((resolve) => {
    reader.question(question, (answer) => {
      reader.close()
      if (hidden) process.stdout.write("\n")
      resolve(answer)
    })
    muted = hidden
  })
}

async function main() {
  const connectionString = readConnectionString(process.env)
  if (!connectionString)
    throw new Error("DATABASE_URL is not set")
  const host = new URL(connectionString).hostname
  console.log(`Database host: ${host}`)

  const name = (await ask("Name: ")).trim()
  const email = normalizeEmail(await ask("Email: "))
  const password = await ask(
    `Password (at least ${MIN_PASSWORD_LENGTH} characters): `,
    true,
  )
  const repeated = await ask("Repeat the password: ", true)

  if (name === "" || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error(
      "A name and a valid email are required.",
    )
  }
  if (!isPasswordLongEnough(password)) {
    throw new Error(
      `The password needs at least ${MIN_PASSWORD_LENGTH} characters.`,
    )
  }
  if (password !== repeated)
    throw new Error("The passwords do not match.")

  const passwordHash = await new PasswordHasher().hash(
    password,
  )
  const db = createDatabase(connectionString)
  const [existing] = await db
    .select({ id: adminsTable.id })
    .from(adminsTable)
    .where(eq(adminsTable.email, email))

  if (existing === undefined) {
    await db
      .insert(adminsTable)
      .values({ name, email, passwordHash })
    console.log(`Created the admin ${email}.`)
    return
  }
  await db
    .update(adminsTable)
    .set({
      name,
      passwordHash,
      failedAttempts: 0,
      lockedUntil: null,
    })
    .where(eq(adminsTable.id, existing.id))
  console.log(
    `Updated the admin ${email} (password reset, lock cleared).`,
  )
}

main()
  .catch((error) => {
    console.error(
      "create-admin failed:",
      error instanceof Error ? error.name : "unknown error",
    )
    process.exitCode = 1
  })
  .finally(() => process.exit())
