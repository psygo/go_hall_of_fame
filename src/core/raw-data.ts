export class InvalidRawDataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidRawDataError"
  }
}

export type RawRecord = Readonly<Record<string, unknown>>

export function asRecord(
  raw: unknown,
  label: string,
): RawRecord {
  if (
    typeof raw !== "object" ||
    raw === null ||
    Array.isArray(raw)
  ) {
    throw new InvalidRawDataError(
      `${label} must be an object`,
    )
  }
  return Object.fromEntries(Object.entries(raw))
}

export function readString(
  record: RawRecord,
  key: string,
): string {
  const value = record[key]
  if (typeof value !== "string") {
    throw new InvalidRawDataError(
      `"${key}" must be a string`,
    )
  }
  return value
}

export function readNullableString(
  record: RawRecord,
  key: string,
): string | null {
  const value = record[key]
  if (value === null || value === undefined) return null
  return readString(record, key)
}

export function readInteger(
  record: RawRecord,
  key: string,
): number {
  const value = record[key]
  if (
    typeof value !== "number" ||
    !Number.isInteger(value)
  ) {
    throw new InvalidRawDataError(
      `"${key}" must be an integer`,
    )
  }
  return value
}

export function readOneOf<T extends string>(
  record: RawRecord,
  key: string,
  allowed: readonly T[],
): T {
  const value = readString(record, key)
  const match = allowed.find(
    (candidate) => candidate === value,
  )
  if (match === undefined) {
    throw new InvalidRawDataError(
      `"${key}" must be one of ${allowed.join(", ")}`,
    )
  }
  return match
}

export function readArray(
  record: RawRecord,
  key: string,
): readonly unknown[] {
  const value = record[key]
  if (!Array.isArray(value)) {
    throw new InvalidRawDataError(
      `"${key}" must be an array`,
    )
  }
  return value
}
