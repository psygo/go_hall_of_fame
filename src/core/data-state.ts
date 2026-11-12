export type DataSuccess<T> = {
  readonly status: "success"
  readonly data: T
}

export type DataFailure = {
  readonly status: "failure"
  readonly error: Error
}

export type DataState<T> = DataSuccess<T> | DataFailure

export function succeed<T>(data: T): DataSuccess<T> {
  return { status: "success", data }
}

export function fail(cause: unknown): DataFailure {
  const error =
    cause instanceof Error
      ? cause
      : new Error(String(cause))
  return { status: "failure", error }
}

export async function captureDataState<T>(
  operation: () => Promise<T>,
): Promise<DataState<T>> {
  try {
    return succeed(await operation())
  } catch (cause) {
    return fail(cause)
  }
}

/** For the presentation boundary: turns a failure into a thrown error so the route's error boundary renders. */
export function unwrapDataState<T>(state: DataState<T>): T {
  if (state.status === "failure") throw state.error
  return state.data
}
